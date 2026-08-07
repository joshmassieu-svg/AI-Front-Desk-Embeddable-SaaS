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
  websiteConfig: WebsiteConfig;
  createdAt: string;
  updatedAt: string;
}

export const createInitialWebsiteConfig = (workplaceId: string, name: string, domain: string): WebsiteConfig => {
  return {
    id: workplaceId,
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
    maxTokens: 512,
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
 * Get or create workplace for a logged-in user in Firestore (default) database.
 * Enforces 1 workplace & 1 website per user.
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
        return workplaceSnap.data() as Workplace;
      }
    }

    // Otherwise create new user profile & workplace
    const workplaceId = `wp_${userId.substring(0, 8)}_${Date.now()}`;
    const defaultDomain = email ? `${email.split('@')[0]}.com` : 'mywebsite.com';
    const defaultName = email ? `${email.split('@')[0]}'s Workplace` : 'My Workplace';
    const websiteConfig = createInitialWebsiteConfig(workplaceId, defaultName, defaultDomain);

    const newWorkplace: Workplace = {
      id: workplaceId,
      userId,
      name: defaultName,
      domain: defaultDomain,
      websiteConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save workplace doc in Firestore
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
 * Update workplace website configuration in Firestore (default) database.
 */
export async function updateWorkplaceWebsiteInFirestore(
  workplaceId: string,
  updates: Partial<WebsiteConfig>
): Promise<WebsiteConfig | null> {
  try {
    const workplaceRef = doc(db, 'workplaces', workplaceId);
    const workplaceSnap = await getDoc(workplaceRef);

    if (!workplaceSnap.exists()) {
      return null;
    }

    const workplace = workplaceSnap.data() as Workplace;
    const updatedWebsiteConfig: WebsiteConfig = {
      ...workplace.websiteConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(workplaceRef, {
      websiteConfig: updatedWebsiteConfig,
      updatedAt: new Date().toISOString(),
    });

    return updatedWebsiteConfig;
  } catch (err) {
    console.error('Error updating workplace website in Firestore:', err);
    return null;
  }
}
