import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db as firestore } from './firebase';
import { firebaseDb } from './firebase-admin';
import {
  WebsiteConfig,
  KnowledgeItem,
  KnowledgeChunk,
  Lead,
  Conversation,
  Message,
  ApiKey,
  Webhook,
  AnalyticsSummary,
} from './types';

/**
 * Thrown when a Firestore read fails after retries (network blip, cold-start
 * connection setup, transient outage). This is NOT the same as "the document
 * doesn't exist" — callers must treat it differently (503, not 404).
 */
export class TransientFirestoreError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'TransientFirestoreError';
  }
}

/**
 * Retry a Firestore read a couple of times before giving up. Cold serverless
 * instances frequently fail their very first Firestore call while the
 * connection is still being established; a short retry clears this up
 * almost every time without meaningfully slowing down the warm-instance
 * common case.
 */
async function withRetry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 150): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastErr;
}

/**
 * Firestore's client SDK rejects any object containing a literal `undefined`
 * value at any depth — "Unsupported field value: undefined" — even with
 * `{ merge: true }`. This has bitten this codebase before (optional fields
 * built with `cond ? value : undefined`). Stripping undefined keys before
 * every write is cheap insurance against the next caller making the same
 * mistake, rather than relying on every call site remembering to omit the
 * key manually.
 */
function stripUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripUndefined) as unknown as T;
  const out: any = {};
  for (const [k, v] of Object.entries(obj as any)) {
    if (v === undefined) continue;
    out[k] = stripUndefined(v);
  }
  return out;
}

// Persistent Database Store connected to Firebase Firestore (default) database
class DatabaseStore {
  private websites: Map<string, WebsiteConfig> = new Map();
  private knowledgeItems: Map<string, KnowledgeItem> = new Map();
  private leads: Lead[] = [];
  private conversations: Map<string, Conversation> = new Map();
  private apiKeys: ApiKey[] = [];
  private webhooks: Webhook[] = [];

  constructor() {
    this.syncFromFirestore().catch((err) =>
      console.warn('Initial Firestore sync notice:', err.message)
    );
  }

  /**
   * Sync collections from Firestore (default) database into memory cache
   */
  public async syncFromFirestore() {
    try {
      // Sync websites
      const sitesSnap = await getDocs(collection(firestore, 'websites'));
      sitesSnap.forEach((d) => {
        const data = d.data() as WebsiteConfig;
        this.websites.set(data.id || d.id, data);
      });

      // Sync knowledge items
      const kbSnap = await getDocs(collection(firestore, 'knowledgeItems'));
      kbSnap.forEach((d) => {
        const data = d.data() as KnowledgeItem;
        this.knowledgeItems.set(data.id || d.id, data);
      });

      // Sync leads
      const leadsSnap = await getDocs(collection(firestore, 'leads'));
      const firestoreLeads: Lead[] = [];
      leadsSnap.forEach((d) => firestoreLeads.push(d.data() as Lead));
      if (firestoreLeads.length > 0) {
        this.leads = firestoreLeads;
      }

      // Sync conversations
      const convsSnap = await getDocs(collection(firestore, 'conversations'));
      convsSnap.forEach((d) => {
        const data = d.data() as Conversation;
        this.conversations.set(data.id || d.id, data);
      });
    } catch (err: any) {
      console.warn('Firestore sync error:', err.message);
    }
  }

  // --- Website Methods ---
  /**
   * Look up a website by id.
   *
   * IMPORTANT: this can fail in two very different ways, and callers must
   * not conflate them:
   *  - resolves to `undefined`      → the site genuinely does not exist
   *  - throws TransientFirestoreError → we couldn't tell (transient read
   *    failure, e.g. cold-start connection setup) — this is NOT a 404
   *
   * `websites/{id}` is the single source of truth. There is no more
   * fallback to a nested `workplaces/{id}.websiteConfig` — every website
   * doc is written directly to this collection at creation time (see
   * firestore-service.ts), including the default site created at signup.
   */
  public async getWebsiteAsync(id: string): Promise<WebsiteConfig | undefined> {
    if (!id) return undefined;

    // 1. Check in-memory cache first (best-effort speedup only — never the
    //    sole source of truth, and never assumed fresh across instances)
    const cached = this.websites.get(id);
    if (cached) return cached;

    try {
      const docSnap = await withRetry(() => getDoc(doc(firestore, 'websites', id)));
      if (docSnap.exists()) {
        const site = docSnap.data() as WebsiteConfig;
        this.websites.set(id, site);
        return site;
      }
      // Doc genuinely doesn't exist — this is a real "not found", not an error
      return undefined;
    } catch (err) {
      console.error(`getWebsiteAsync: Firestore read failed for "${id}" after retries:`, err);
      throw new TransientFirestoreError(`Could not read website "${id}"`, err);
    }
  }

  public getWebsite(id: string): WebsiteConfig | undefined {
    if (!id) return undefined;
    return this.websites.get(id);
  }

  public getAllWebsites(): WebsiteConfig[] {
    return Array.from(this.websites.values());
  }

  public async updateWebsiteAsync(id: string, updates: Partial<WebsiteConfig>): Promise<WebsiteConfig> {
    const existing = await this.getWebsiteAsync(id);
    const updated = { ...(existing || {}), ...updates, id, updatedAt: new Date().toISOString() } as WebsiteConfig;
    this.websites.set(id, updated);

    try {
      // `websites` is the single source of truth — no more mirrored write
      // to a nested `workplaces/{id}.websiteConfig`. Two copies of the same
      // config drifting apart was the root cause of several bugs.
      await setDoc(doc(firestore, 'websites', id), updated, { merge: true });
    } catch (err) {
      console.error('Error writing website to Firestore:', err);
    }
    return updated;
  }

  public updateWebsite(id: string, updates: Partial<WebsiteConfig>): WebsiteConfig {
    const existing = this.getWebsite(id);
    if (!existing) throw new Error('Website not found');
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.websites.set(id, updated);
    setDoc(doc(firestore, 'websites', id), updated, { merge: true }).catch((e) =>
      console.error('Error persisting website to Firestore:', e)
    );
    return updated;
  }

  public async createWebsite(site: Omit<WebsiteConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebsiteConfig> {
    const id = `site_${Date.now()}`;
    const newSite: WebsiteConfig = {
      ...site,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.websites.set(id, newSite);
    try {
      await setDoc(doc(firestore, 'websites', id), newSite);
    } catch (err) {
      console.error('Error creating website in Firestore:', err);
    }
    return newSite;
  }

  // --- Knowledge Base Methods ---
  public getKnowledgeItems(websiteId: string): KnowledgeItem[] {
    return Array.from(this.knowledgeItems.values()).filter((k) => k.websiteId === websiteId);
  }

  public async getKnowledgeItemsAsync(websiteId: string): Promise<KnowledgeItem[]> {
    try {
      const q = query(collection(firestore, 'knowledgeItems'), where('websiteId', '==', websiteId));
      const snap = await getDocs(q);
      const items: KnowledgeItem[] = [];
      snap.forEach((d) => {
        const item = d.data() as KnowledgeItem;
        this.knowledgeItems.set(item.id || d.id, item);
        items.push(item);
      });
      if (items.length > 0) return items;
    } catch (err) {
      console.error('Error querying knowledgeItems from Firestore:', err);
    }
    return this.getKnowledgeItems(websiteId);
  }

  public async addKnowledgeItemAsync(item: Omit<KnowledgeItem, 'id' | 'lastSyncedAt'>): Promise<KnowledgeItem> {
    const id = `kb_${Date.now()}`;
    const newItem: KnowledgeItem = {
      ...item,
      id,
      lastSyncedAt: new Date().toISOString(),
    };
    this.knowledgeItems.set(id, newItem);
    try {
      await setDoc(doc(firestore, 'knowledgeItems', id), newItem);
    } catch (err) {
      console.error('Error saving knowledge item to Firestore:', err);
    }
    return newItem;
  }

  /**
   * Store pre-embedded chunks for a knowledge item. Each chunk is its own
   * doc in `knowledgeChunks` — this is what vector search queries against,
   * as opposed to `knowledgeItems`, which stays as the raw source record
   * (crawl/paste metadata, status, dashboard display).
   */
  /**
   * Store pre-embedded chunks for a knowledge item. Each chunk is its own
   * doc in `knowledgeChunks` — this is what vector search queries against,
   * as opposed to `knowledgeItems`, which stays as the raw source record
   * (crawl/paste metadata, status, dashboard display).
   *
   * PAIN POINT (fixed): this previously wrote via the client SDK
   * (`setDoc` on `firestore`), which stores `embedding` as a plain array
   * of numbers. `findNearest` vector search (admin SDK) requires the
   * field to be Firestore's native Vector type, written via
   * `FieldValue.vector(...)` — a plain array field never matches the
   * vector index, no matter how many chunks exist. Result: crawling and
   * indexing appeared to succeed, but every vector search silently
   * returned 0 chunks. Writes now go through the admin SDK so the field
   * type actually matches what queryKnowledgeChunksByVectorAsync expects.
   */
  public async addKnowledgeChunksAsync(chunks: Omit<KnowledgeChunk, 'id' | 'createdAt'>[]): Promise<number> {
    if (!firebaseDb) {
      console.error(
        `[db] PAIN POINT: cannot write knowledge chunks with correct vector type — ` +
        `Firebase Admin SDK is not initialized (missing service account credentials). ` +
        `Chunks will NOT be findable by vector search until this is fixed.`
      );
      return 0;
    }

    const { FieldValue } = await import('firebase-admin/firestore');
    let saved = 0;
    for (const chunk of chunks) {
      const id = `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const { embedding, ...rest } = chunk;
      const record = {
        ...rest,
        id,
        embedding: FieldValue.vector(embedding),
        createdAt: new Date().toISOString(),
      };
      try {
        await firebaseDb.collection('knowledgeChunks').doc(id).set(record);
        saved++;
      } catch (err) {
        console.error(`[db] PAIN POINT: failed to save knowledge chunk ${id} via admin SDK:`, err);
      }
    }
    console.log(`[db] addKnowledgeChunksAsync saved ${saved}/${chunks.length} chunk(s) with native Vector type`);
    return saved;
  }

  public async deleteKnowledgeChunksForItemAsync(knowledgeItemId: string): Promise<void> {
    try {
      const q = query(collection(firestore, 'knowledgeChunks'), where('knowledgeItemId', '==', knowledgeItemId));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    } catch (err) {
      console.error('Error deleting knowledge chunks:', err);
    }
  }

  /**
   * Vector nearest-neighbor search via Firestore's native vector search
   * (findNearest). Requires:
   *   1. The Firebase ADMIN SDK — vector search (`findNearest`) is only
   *      supported by the server-side client libraries (Node.js Admin,
   *      Python, Go, Java). It is NOT available in the client Web SDK
   *      (`firebase/firestore`), which has no findNearest export at all.
   *      This function therefore uses `firebaseDb` (firebase-admin),
   *      not the `firestore` (client SDK) instance used elsewhere in
   *      this file.
   *   2. A vector index configured on `knowledgeChunks.embedding`
   *      (see firestore.indexes.json — deployed via `firebase deploy
   *      --only firestore:indexes`, not creatable from the console UI).
   *
   * Falls back to returning an empty array (not throwing) if the vector
   * query itself fails — a missing index, missing admin credentials, or
   * unsupported SDK version shouldn't take down the whole chat response,
   * it should just mean no knowledge context was found for this turn.
   */
  public async queryKnowledgeChunksByVectorAsync(
    websiteId: string,
    queryEmbedding: number[],
    topK = 5
  ): Promise<KnowledgeChunk[]> {
    if (!firebaseDb) {
      console.error('[db] PAIN POINT: vector search failed — Firebase Admin SDK is not initialized (missing service account credentials).');
      return [];
    }
    try {
      const { FieldValue } = await import('firebase-admin/firestore');
      const baseQuery = firebaseDb.collection('knowledgeChunks').where('websiteId', '==', websiteId);
      // Admin SDK signature (per Firebase docs): findNearest(options object).
      const nearestQuery = baseQuery.findNearest({
        vectorField: 'embedding',
        queryVector: FieldValue.vector(queryEmbedding),
        limit: topK,
        distanceMeasure: 'COSINE',
      });
      const snap = await nearestQuery.get();
      console.log(`[db] vector search returned ${snap.docs.length} chunk(s) for websiteId=${websiteId}`);
      return snap.docs.map((d) => d.data() as KnowledgeChunk);
    } catch (err) {
      console.error('[db] PAIN POINT: vector search query failed (check vector index is deployed):', err);
      return [];
    }
  }

  public addKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'lastSyncedAt'>): KnowledgeItem {
    const id = `kb_${Date.now()}`;
    const newItem: KnowledgeItem = {
      ...item,
      id,
      lastSyncedAt: new Date().toISOString(),
    };
    this.knowledgeItems.set(id, newItem);
    setDoc(doc(firestore, 'knowledgeItems', id), newItem).catch((e) =>
      console.error('Error persisting knowledge item to Firestore:', e)
    );
    return newItem;
  }

  public async deleteKnowledgeItemAsync(id: string): Promise<boolean> {
    this.knowledgeItems.delete(id);
    try {
      await deleteDoc(doc(firestore, 'knowledgeItems', id));
      await this.deleteKnowledgeChunksForItemAsync(id);
      return true;
    } catch (err) {
      console.error('Error deleting knowledge item from Firestore:', err);
      return false;
    }
  }

  public async updateKnowledgeItemStatusAsync(
    id: string,
    status: KnowledgeItem['status'],
    chunksCount: number
  ): Promise<void> {
    try {
      await updateDoc(doc(firestore, 'knowledgeItems', id), { status, chunksCount });
      const cached = this.knowledgeItems.get(id);
      if (cached) this.knowledgeItems.set(id, { ...cached, status, chunksCount });
    } catch (err) {
      console.error('Error updating knowledge item status:', err);
    }
  }

  public deleteKnowledgeItem(id: string): boolean {
    const deleted = this.knowledgeItems.delete(id);
    deleteDoc(doc(firestore, 'knowledgeItems', id)).catch((e) =>
      console.error('Error deleting knowledge item from Firestore:', e)
    );
    return deleted;
  }

  // --- Leads Methods ---
  public getLeads(websiteId: string): Lead[] {
    return this.leads.filter((l) => l.websiteId === websiteId);
  }

  public async getLeadsAsync(websiteId: string): Promise<Lead[]> {
    try {
      const q = query(collection(firestore, 'leads'), where('websiteId', '==', websiteId));
      const snap = await getDocs(q);
      const leads: Lead[] = [];
      snap.forEach((d) => leads.push(d.data() as Lead));
      if (leads.length > 0) {
        this.leads = leads;
        return leads;
      }
    } catch (err) {
      console.error('Error fetching leads from Firestore:', err);
    }
    return this.getLeads(websiteId);
  }

  public async addLeadAsync(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
    const id = `lead_${Date.now()}`;
    const newLead: Lead = {
      ...lead,
      id,
      createdAt: new Date().toISOString(),
    };
    this.leads.unshift(newLead);
    try {
      await setDoc(doc(firestore, 'leads', id), newLead);
    } catch (err) {
      console.error('Error adding lead to Firestore:', err);
    }
    return newLead;
  }

  public addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Lead {
    const id = `lead_${Date.now()}`;
    const newLead: Lead = {
      ...lead,
      id,
      createdAt: new Date().toISOString(),
    };
    this.leads.unshift(newLead);
    setDoc(doc(firestore, 'leads', id), newLead).catch((e) =>
      console.error('Error persisting lead to Firestore:', e)
    );
    return newLead;
  }

  // --- Conversations & Live Handoff Methods ---
  public getConversations(websiteId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter((c) => c.websiteId === websiteId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public async getConversationsAsync(websiteId: string): Promise<Conversation[]> {
    try {
      const q = query(collection(firestore, 'conversations'), where('websiteId', '==', websiteId));
      const snap = await getDocs(q);
      const convs: Conversation[] = [];
      snap.forEach((d) => {
        const c = d.data() as Conversation;
        this.conversations.set(c.id || d.id, c);
        convs.push(c);
      });
      if (convs.length > 0) {
        return convs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
    } catch (err) {
      console.error('Error querying conversations from Firestore:', err);
    }
    return this.getConversations(websiteId);
  }

  public getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  public async getConversationAsync(id: string): Promise<Conversation | undefined> {
    try {
      const docSnap = await getDoc(doc(firestore, 'conversations', id));
      if (docSnap.exists()) {
        const conv = docSnap.data() as Conversation;
        this.conversations.set(id, conv);
        return conv;
      }
    } catch (err) {
      console.error('Error fetching conversation from Firestore:', err);
    }
    return this.getConversation(id);
  }

  public createOrGetConversation(
    websiteId: string,
    visitorId: string,
    metadata?: Partial<Conversation>
  ): Conversation {
    const existing = Array.from(this.conversations.values()).find(
      (c) => c.websiteId === websiteId && c.visitorId === visitorId
    );
    if (existing) return existing;

    const id = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id,
      websiteId,
      visitorId,
      visitorDevice: metadata?.visitorDevice || 'Web Browser',
      visitorLocation: metadata?.visitorLocation || 'Online Visitor',
      currentUrl: metadata?.currentUrl || '',
      status: 'ai',
      unreadCount: 0,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(id, newConv);
    setDoc(doc(firestore, 'conversations', id), newConv).catch((e) =>
      console.error('Error persisting conversation to Firestore:', e)
    );
    return newConv;
  }

  public async createOrGetConversationAsync(
    websiteId: string,
    visitorId: string,
    metadata?: Partial<Conversation>
  ): Promise<Conversation> {
    try {
      const q = query(
        collection(firestore, 'conversations'),
        where('websiteId', '==', websiteId),
        where('visitorId', '==', visitorId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        if (snap.docs.length > 1) {
          console.warn(`[db] PAIN POINT: multiple conversations found for websiteId=${websiteId} visitorId=${visitorId} — using the first one. This shouldn't happen with a unique visitorId.`);
        }
        const conv = snap.docs[0].data() as Conversation;
        this.conversations.set(conv.id, conv);
        return conv;
      }
    } catch (err) {
      console.error('[db] PAIN POINT: error querying existing conversation in Firestore:', err);
    }

    const id = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id,
      websiteId,
      visitorId,
      visitorDevice: metadata?.visitorDevice || 'Web Browser',
      visitorLocation: metadata?.visitorLocation || 'Online Visitor',
      currentUrl: metadata?.currentUrl || '',
      status: 'ai',
      unreadCount: 0,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(id, newConv);
    try {
      await setDoc(doc(firestore, 'conversations', id), stripUndefined(newConv));
    } catch (err) {
      console.error('Error creating conversation in Firestore:', err);
    }
    return newConv;
  }

  public addMessage(conversationId: string, msg: Omit<Message, 'id' | 'createdAt'>): Message {
    const conv = this.conversations.get(conversationId);
    const newMsg: Message = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    if (conv) {
      conv.messages.push(newMsg);
      conv.updatedAt = newMsg.createdAt;
      if (msg.sender === 'visitor' && conv.status === 'human_active') {
        conv.unreadCount = (conv.unreadCount || 0) + 1;
      }
      this.conversations.set(conversationId, conv);
      setDoc(doc(firestore, 'conversations', conversationId), conv, { merge: true }).catch((e) =>
        console.error('Error persisting message to Firestore:', e)
      );
    }
    return newMsg;
  }

  public async addMessageAsync(conversationId: string, msg: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    let conv = await this.getConversationAsync(conversationId);
    const newMsg: Message = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    if (!conv) {
      console.warn(`[db] PAIN POINT: addMessageAsync called for unknown conversationId=${conversationId} — message not persisted`);
    }

    if (conv) {
      const updatedMessages = [...(conv.messages || []), newMsg];
      const updatedConv = {
        ...conv,
        messages: updatedMessages,
        updatedAt: newMsg.createdAt,
        unreadCount: msg.sender === 'visitor' && conv.status === 'human_active' ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
      };
      this.conversations.set(conversationId, updatedConv);
      try {
        await setDoc(doc(firestore, 'conversations', conversationId), stripUndefined(updatedConv), { merge: true });
      } catch (err) {
        console.error('Error adding message in Firestore:', err);
      }
    }
    return newMsg;
  }

  // PAIN POINT (fixed): this used to be sync, read only the in-memory
  // Map (unreliable on serverless — a cold instance may never have seen
  // this conversation), and fired its Firestore write without awaiting
  // it, so a caller had no guarantee the status change had actually
  // landed by the time it told the visitor "an agent will join shortly".
  public async updateConversationStatus(
    id: string,
    status: Conversation['status'],
    assignedAgent?: string
  ): Promise<Conversation | undefined> {
    const conv = await this.getConversationAsync(id);
    if (!conv) {
      console.warn(`[db.updateConversationStatus] PAIN POINT: conversation ${id} not found — status update to "${status}" dropped`);
      return undefined;
    }
    const updatedConv: Conversation = {
      ...conv,
      status,
      ...(assignedAgent !== undefined ? { assignedAgent } : {}),
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(id, updatedConv);
    try {
      await setDoc(doc(firestore, 'conversations', id), stripUndefined(updatedConv), { merge: true });
    } catch (err) {
      console.error(`[db.updateConversationStatus] PAIN POINT: Firestore write failed for conversation ${id}`, err);
      throw err;
    }
    return updatedConv;
  }

  public getAnalyticsSummary(websiteId: string): AnalyticsSummary {
    const convs = this.getConversations(websiteId);
    const leads = this.getLeads(websiteId);
    const totalMsgs = convs.reduce((acc, c) => acc + (c.messages ? c.messages.length : 0), 0);
    const resolvedCount = convs.filter((c) => c.status === 'resolved' || c.status === 'ai').length;

    return {
      totalConversations: convs.length,
      totalMessages: totalMsgs,
      totalLeads: leads.length,
      resolutionRate: convs.length > 0 ? Number(((resolvedCount / convs.length) * 100).toFixed(1)) : 0,
      csatScore: 0,
      avgResponseTimeSec: 0,
      knowledgeCoverage: 0,
      tokenUsage: totalMsgs * 150,
      activeVisitorsNow: convs.filter((c) => c.status === 'ai' || c.status === 'human_active').length,
    };
  }
}

// Global singleton instance connected to Firestore (default) database
export const db = new DatabaseStore();
