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
import { WebsiteConfig, Lead, KnowledgeItem, WorkplaceMember, WorkplaceInvitation, WorkplaceRole } from './types';

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
  members?: WorkplaceMember[];
  /**
   * @deprecated No longer written for new workplaces. `websites/{id}` is now
   * the single source of truth for site config — this field only appears on
   * documents created before the consolidation, and is only ever read as a
   * one-time migration source (see migrateLegacyWorkplace below).
   */
  websiteConfig?: WebsiteConfig;
  /**
   * ISO timestamp written by completeOnboardingInFirestore() when the user
   * finishes the /onboarding flow for the first time. Absence means the user
   * has not yet completed onboarding. Used as the single source of truth for
   * the onboarding guard in dashboard/layout.tsx — replaces the old
   * localStorage 'flowdexx_onboarded' flag which broke on new devices.
   */
  onboardedAt?: string;
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
    launcherPlaceholders: [
      'Ask me anything...',
      'How do I get started?',
      'What are your pricing plans?',
      'Book a live product demo...'
    ],
    placeholderEffect: 'random',
    placeholderSpeed: 3500,
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

    // Otherwise create new user profile & workplace (skeleton only — no site doc).
    // The first website is written later by completeOnboardingInFirestore() once
    // the user submits Step 1 of /onboarding with their real domain. This avoids
    // orphaned placeholder sites for users who abandon before onboarding.
    const workplaceId = `wp_${userId.substring(0, 8)}_${Date.now()}`;
    const defaultName = email ? `${email.split('@')[0]}'s Workplace` : 'My Workplace';

    const newWorkplace: Workplace = {
      id: workplaceId,
      userId,
      name: defaultName,
      domain: '',
      members: [
        {
          userId,
          email: email || 'owner@workplace.com',
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Account metadata only — no site config written yet.
    await setDoc(doc(db, 'workplaces', workplaceId), newWorkplace);

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
 * Called when the user submits Step 1 of /onboarding. Creates the first real
 * website doc for the user's workplace (with their actual domain) and stamps
 * `onboardedAt` on the workplace so the dashboard guard can rely on Firestore
 * instead of localStorage.
 */
export async function completeOnboardingInFirestore(
  userId: string,
  workplaceId: string,
  name: string,
  domain: string
): Promise<{ workplace: Workplace; website: WebsiteConfig }> {
  const cleanedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const now = new Date().toISOString();

  const websiteConfig = createInitialWebsiteConfig(workplaceId, name.trim(), cleanedDomain);
  (websiteConfig as any).userId = userId;

  // Write the real site doc
  await setDoc(doc(db, 'websites', workplaceId), websiteConfig);

  // Stamp onboardedAt + update domain on the workplace doc
  await updateDoc(doc(db, 'workplaces', workplaceId), {
    name: name.trim(),
    domain: cleanedDomain,
    onboardedAt: now,
    updatedAt: now,
  });

  const updatedWorkplace: Workplace = {
    id: workplaceId,
    userId,
    name: name.trim(),
    domain: cleanedDomain,
    onboardedAt: now,
    createdAt: now, // approximate — actual createdAt is on the Firestore doc
    updatedAt: now,
  };

  return { workplace: updatedWorkplace, website: websiteConfig };
}

/**
 * Create a new Workplace and its 1 dedicated Website (1 website per Workplace).
 */
export async function createNewWorkplaceWithWebsite(
  userId: string,
  email: string,
  name: string,
  domain: string
): Promise<{ workplace: Workplace; website: WebsiteConfig }> {
  const workplaceId = `wp_${userId.substring(0, 6)}_${Date.now()}`;
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '');

  const newWorkplace: Workplace = {
    id: workplaceId,
    userId,
    name: name.trim(),
    domain: cleanDomain,
    members: [
      {
        userId,
        email: email || 'owner@workplace.com',
        role: 'owner',
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const websiteConfig = createInitialWebsiteConfig(workplaceId, name.trim(), cleanDomain);
  (websiteConfig as any).userId = userId;

  try {
    await setDoc(doc(db, 'workplaces', workplaceId), newWorkplace);
    await setDoc(doc(db, 'websites', workplaceId), websiteConfig);

    // Set user's active workplace
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      workplaceId,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error creating new workplace with website:', err);
  }

  return { workplace: newWorkplace, website: websiteConfig };
}

/**
 * Create a new distinct website & workplace in Firestore.
 */
export async function createWebsiteInFirestore(
  userId: string,
  workplaceId: string,
  name: string,
  domain: string
): Promise<WebsiteConfig> {
  const { website } = await createNewWorkplaceWithWebsite(userId, '', name, domain);
  return website;
}

/**
 * Retrieve team members for a workplace.
 */
export async function getWorkplaceMembers(workplaceId: string): Promise<WorkplaceMember[]> {
  try {
    const workplaceRef = doc(db, 'workplaces', workplaceId);
    const snap = await getDoc(workplaceRef);
    if (!snap.exists()) return [];
    const wp = snap.data() as Workplace;
    if (wp.members && wp.members.length > 0) {
      return wp.members;
    }
    // Default fallback owner if members array isn't populated yet
    const ownerMember: WorkplaceMember = {
      userId: wp.userId,
      email: `${wp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@workplace.com`,
      role: 'owner',
      joinedAt: wp.createdAt || new Date().toISOString(),
    };
    return [ownerMember];
  } catch (err) {
    console.error('Error getting workplace members:', err);
    return [];
  }
}

/**
 * Create an invitation for a user to join a workplace.
 */
export async function createWorkplaceInvitation(
  workplaceId: string,
  workplaceName: string,
  email: string,
  role: WorkplaceRole,
  createdBy: string
): Promise<WorkplaceInvitation> {
  const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const inviteCode = `code_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;

  const invitation: WorkplaceInvitation = {
    id: inviteId,
    workplaceId,
    workplaceName,
    email: email.toLowerCase().trim(),
    role,
    inviteCode,
    status: 'pending',
    createdBy,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const inviteRef = doc(db, 'invitations', inviteId);
  await setDoc(inviteRef, invitation);
  return invitation;
}

/**
 * Fetch all pending invitations for a workplace.
 */
export async function getWorkplaceInvitations(workplaceId: string): Promise<WorkplaceInvitation[]> {
  try {
    const invRef = collection(db, 'invitations');
    const q = query(invRef, where('workplaceId', '==', workplaceId), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    const list: WorkplaceInvitation[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as WorkplaceInvitation);
    });
    return list;
  } catch (err) {
    console.error('Error fetching invitations:', err);
    return [];
  }
}

/**
 * Fetch an invitation by its unique code.
 */
export async function getInvitationByCode(inviteCode: string): Promise<WorkplaceInvitation | null> {
  try {
    const invRef = collection(db, 'invitations');
    const q = query(invRef, where('inviteCode', '==', inviteCode));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as WorkplaceInvitation;
  } catch (err) {
    console.error('Error fetching invitation by code:', err);
    return null;
  }
}

/**
 * Accept a workplace invitation and bind the user to that workplace.
 */
export async function acceptWorkplaceInvitation(
  inviteCode: string,
  userId: string,
  userEmail: string
): Promise<{ success: boolean; workplaceId?: string; error?: string }> {
  try {
    const invite = await getInvitationByCode(inviteCode);
    if (!invite) return { success: false, error: 'Invalid invite code.' };
    if (invite.status !== 'pending') return { success: false, error: 'Invitation is no longer active.' };

    if (new Date(invite.expiresAt) < new Date()) {
      await updateDoc(doc(db, 'invitations', invite.id), { status: 'expired' });
      return { success: false, error: 'Invitation has expired.' };
    }

    // Strict email check: ensure logged-in user matches the email specified in invitation
    if (invite.email && userEmail.toLowerCase().trim() !== invite.email.toLowerCase().trim()) {
      return {
        success: false,
        error: `This invitation was specifically issued to ${invite.email}. You are currently logged in as ${userEmail}. Please sign in with ${invite.email} to accept.`,
      };
    }

    // 1. Update user profile workplaceId in Firestore
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      uid: userId,
      email: userEmail,
      workplaceId: invite.workplaceId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 2. Add user to workplace members list
    const workplaceRef = doc(db, 'workplaces', invite.workplaceId);
    const wpSnap = await getDoc(workplaceRef);
    if (wpSnap.exists()) {
      const wp = wpSnap.data() as Workplace;
      const currentMembers = wp.members || [];

      const existingIdx = currentMembers.findIndex(
        (m) => m.userId === userId || m.email.toLowerCase() === userEmail.toLowerCase()
      );

      if (existingIdx >= 0) {
        currentMembers[existingIdx] = {
          userId,
          email: userEmail,
          role: invite.role,
          joinedAt: new Date().toISOString(),
        };
      } else {
        currentMembers.push({
          userId,
          email: userEmail,
          role: invite.role,
          joinedAt: new Date().toISOString(),
        });
      }

      await updateDoc(workplaceRef, {
        members: currentMembers,
        updatedAt: new Date().toISOString(),
      });
    }

    // 3. Mark invitation as accepted
    await updateDoc(doc(db, 'invitations', invite.id), {
      status: 'accepted',
      acceptedBy: userId,
      acceptedAt: new Date().toISOString(),
    });

    return { success: true, workplaceId: invite.workplaceId };
  } catch (err: any) {
    console.error('Error accepting workplace invitation:', err);
    return { success: false, error: err.message || 'Failed to accept invitation.' };
  }
}

/**
 * Remove a team member from a workplace.
 */
export async function removeWorkplaceMember(workplaceId: string, targetUserId: string): Promise<boolean> {
  try {
    const workplaceRef = doc(db, 'workplaces', workplaceId);
    const snap = await getDoc(workplaceRef);
    if (!snap.exists()) return false;

    const wp = snap.data() as Workplace;
    const members = wp.members || [];
    const updatedMembers = members.filter((m) => m.userId !== targetUserId);

    await updateDoc(workplaceRef, {
      members: updatedMembers,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Error removing workplace member:', err);
    return false;
  }
}

/**
 * Revoke an active workplace invitation.
 */
export async function revokeWorkplaceInvitation(inviteId: string): Promise<boolean> {
  try {
    const inviteRef = doc(db, 'invitations', inviteId);
    await updateDoc(inviteRef, {
      status: 'revoked',
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Error revoking invitation:', err);
    return false;
  }
}

/**
 * Retrieve all workplaces accessible by a user (either owned or as a member).
 */
export async function getUserWorkplacesFromFirestore(userId: string, email: string): Promise<Workplace[]> {
  try {
    const workplacesRef = collection(db, 'workplaces');
    const querySnap = await getDocs(workplacesRef);
    const results: Workplace[] = [];

    querySnap.forEach((docSnap) => {
      const wp = docSnap.data() as Workplace;
      const isOwner = wp.userId === userId;
      const isMember = wp.members?.some(
        (m) => m.userId === userId || (email && m.email.toLowerCase() === email.toLowerCase())
      );

      if (isOwner || isMember) {
        results.push(wp);
      }
    });

    return results;
  } catch (err) {
    console.error('Error fetching user workplaces:', err);
    return [];
  }
}

/**
 * Switch active workplace for a user profile.
 */
export async function switchUserWorkplaceInFirestore(userId: string, workplaceId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      workplaceId,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Error switching active user workplace:', err);
    return false;
  }
}


