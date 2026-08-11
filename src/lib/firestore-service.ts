import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { WebsiteConfig, Lead, KnowledgeItem } from './types';

export interface UserProfile {
  uid: string;
  email: string;
  workplaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workplace {
  id: string;
  userId: string;
  name: string;
  domain: string;
  /**
   * @deprecated No longer written for new workplaces. `websites/{id}` is now
   * the single source of truth for site config — this field only appears on
   * documents created before the consolidation, and is only ever read as a
   * one-time migration source (see migrateLegacyWorkplace below).
   */
  websiteConfig?: WebsiteConfig;
  createdAt: string;
  updatedAt: string;
}

export const createInitialWebsiteConfig = (workplaceId: string, name: string, domain: string): WebsiteConfig => {
  return {
    id: workplaceId,
    // Every website doc carries its owning workplaceId from the moment it's
    // created — this is what `getUserWebsitesFromFirestore`'s query depends
    // on. Previously only sites created via createWebsiteInFirestore got
    // this field, which meant a user's original/default site was invisible
    // to that query and would silently disappear from the site list the
    // moment a second site was added.
    workplaceId,
    name,
    domain,
    allowedDomains: [domain, 'localhost', '127.0.0.1'],
    apiKey: `pk_live_${workplaceId.replace(/[^a-zA-Z0-9]/g, '')}`,
    theme: 'dark',
    primaryColor: '#536df4',
    textColor: '#ffffff',
    backgroundColor: '#0f172a',
    position: 'bottom-right',
    welcomeMessage: `👋 Welcome to ${name}! How can I assist you today?`,
    botName: `${name} Copilot`,
    botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    launcherIcon: 'sparkles',
    launcherStyle: 'bar',
    launcherText: 'Ask AI anything...',
    launcherPlaceholder: 'Type your question...',
    borderRadius: 16,
    fontFamily: 'Inter, system-ui, sans-serif',
    customCss: '',
    onlineStatus: 'online',
    offlineMessage: 'We are currently offline. Leave your email and our team will follow up!',
    leadFormEnabled: true,
    leadFormTitle: 'Want personalized onboarding?',
    leadFields: { name: true, email: true, phone: false, company: true },
    model: 'gemini-1.5-flash',
    systemPrompt: `You are an AI Customer Support Assistant for ${domain}. Be helpful, concise, and professional.`,
    temperature: 0.3,
    // PAIN POINT (fixed): 512 was too low once thinking-token usage is
    // considered — see gemini.ts. Bumped so a default/unconfigured site
    // doesn't silently produce empty answers.
    maxTokens: 1024,
    restrictedTopics: [],
    suggestedQuestions: ['What features do you offer?', 'Pricing details', 'How to contact support?'],
    handoffEnabled: true,
    handoffTriggerWords: ['human', 'agent', 'support rep', 'real person'],
    rateLimitPerMin: 60,
    domainVerificationSecret: `sec_${workplaceId}_verify`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * One-time self-heal for accounts created before the collection
 * consolidation: if a `workplaces/{id}` doc still has the old nested
 * `websiteConfig` field, and there's no corresponding `websites/{id}` doc
 * yet (or it's missing workplaceId), migrate it over. Safe to run every
 * login — it's a no-op once migrated.
 */
async function migrateLegacyWorkplaceIfNeeded(workplace: Workplace): Promise<void> {
  if (!workplace.websiteConfig) return; // already on the new shape

  const legacyConfig = workplace.websiteConfig;
  const migratedConfig: WebsiteConfig = {
    ...legacyConfig,
    id: workplace.id,
    workplaceId: workplace.id,
    userId: workplace.userId,
  };

  try {
    await setDoc(doc(db, 'websites', workplace.id), migratedConfig, { merge: true });
    // Strip the legacy nested field so this doesn't run again and so the
    // two copies can't drift apart from here on.
    await updateDoc(doc(db, 'workplaces', workplace.id), {
      websiteConfig: null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Legacy workplace migration failed for', workplace.id, err);
    // Non-fatal — worst case it retries next login.
  }
}

/**
 * Get or create workplace for a logged-in user in Firestore (default) database.
 *
 * `workplaces/{id}` holds only account metadata now. Site config lives
 * exclusively in `websites/{id}`, which is the single source of truth read
 * by every API route.
 */
export async function getOrCreateUserWorkplace(userId: string, email: string): Promise<Workplace> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      const workplaceRef = doc(db, 'workplaces', userData.workplaceId);
      const workplaceSnap = await getDoc(workplaceRef);

      if (workplaceSnap.exists()) {
        const workplace = workplaceSnap.data() as Workplace;
        await migrateLegacyWorkplaceIfNeeded(workplace);
        return workplace;
      }
    }

    // Otherwise create new user profile & workplace
    const workplaceId = `wp_${userId.substring(0, 8)}_${Date.now()}`;
    const defaultDomain = email ? `${email.split('@')[0]}.com` : 'mywebsite.com';
    const defaultName = email ? `${email.split('@')[0]}'s Workplace` : 'My Workplace';
    const websiteConfig = createInitialWebsiteConfig(workplaceId, defaultName, defaultDomain);
    (websiteConfig as any).userId = userId;

    const newWorkplace: Workplace = {
      id: workplaceId,
      userId,
      name: defaultName,
      domain: defaultDomain,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Account metadata only — no nested site config anymore.
    await setDoc(doc(db, 'workplaces', workplaceId), newWorkplace);
    // The site itself lives in `websites`, with workplaceId/userId already
    // set so it's found by getUserWebsitesFromFirestore from day one.
    await setDoc(doc(db, 'websites', workplaceId), websiteConfig);

    // Save user profile doc in Firestore
    const newUserProfile: UserProfile = {
      uid: userId,
      email,
      workplaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, newUserProfile);

    return newWorkplace;
  } catch (err) {
    console.error('Error fetching/creating user workplace in Firestore:', err);
    // Fallback workplace object if Firestore rules block or offline
    const fallbackId = `wp_${userId}`;
    return {
      id: fallbackId,
      userId,
      name: 'Personal Workplace',
      domain: 'mywebsite.com',
      websiteConfig: createInitialWebsiteConfig(fallbackId, 'Personal Workplace', 'mywebsite.com'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Update a specific website's config in Firestore.
 *
 * IMPORTANT: this takes the actual siteId being edited, not a workplaceId.
 * The previous version of this function always wrote to
 * `workplaces/{workplaceId}.websiteConfig` regardless of which site the
 * user was actually editing — so on any account with more than one site,
 * editing site B would silently overwrite site A's (the default site's)
 * config instead. There is only one collection now (`websites`), so this
 * ambiguity can't happen: the id passed in is exactly the doc updated.
 */
export async function updateWebsiteInFirestore(
  siteId: string,
  updates: Partial<WebsiteConfig>
): Promise<WebsiteConfig | null> {
  try {
    const siteRef = doc(db, 'websites', siteId);
    const siteSnap = await getDoc(siteRef);

    if (!siteSnap.exists()) {
      return null;
    }

    const existing = siteSnap.data() as WebsiteConfig;
    const updatedWebsiteConfig: WebsiteConfig = {
      ...existing,
      ...updates,
      id: siteId,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(siteRef, updatedWebsiteConfig, { merge: true });

    return updatedWebsiteConfig;
  } catch (err) {
    console.error('Error updating website in Firestore:', err);
    return null;
  }
}

/**
 * Fetch all websites created by a user/workplace from Firestore.
 */
export async function getUserWebsitesFromFirestore(userId: string, workplaceId: string): Promise<WebsiteConfig[]> {
  try {
    const websitesRef = collection(db, 'websites');
    const q = query(websitesRef, where('workplaceId', '==', workplaceId));
    const querySnap = await getDocs(q);

    const results: WebsiteConfig[] = [];
    querySnap.forEach((docSnap) => {
      results.push(docSnap.data() as WebsiteConfig);
    });

    if (results.length > 0) {
      return results;
    }
  } catch (err) {
    console.error('Error querying user websites from Firestore:', err);
  }
  return [];
}

/**
 * Create a new distinct website for a workplace in Firestore.
 */
export async function createWebsiteInFirestore(
  userId: string,
  workplaceId: string,
  name: string,
  domain: string
): Promise<WebsiteConfig> {
  const siteId = `site_${userId.substring(0, 6)}_${Date.now()}`;
  const websiteConfig = createInitialWebsiteConfig(siteId, name, domain);
  (websiteConfig as any).workplaceId = workplaceId;
  (websiteConfig as any).userId = userId;

  try {
    await setDoc(doc(db, 'websites', siteId), websiteConfig);
  } catch (err) {
    console.error('Error creating website doc in Firestore:', err);
  }

  return websiteConfig;
}
