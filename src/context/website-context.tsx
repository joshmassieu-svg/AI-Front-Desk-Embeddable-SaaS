'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteConfig, SubscriptionPlanId, BillingCycle } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import {
  getOrCreateUserWorkplace,
  updateWebsiteInFirestore,
  getUserWebsitesFromFirestore,
  createWebsiteInFirestore,
  createNewWorkplaceWithWebsite,
  switchUserWorkplaceInFirestore,
  createInitialWebsiteConfig,
  completeOnboardingInFirestore,
  updateWorkplacePlanInFirestore,
  Workplace,
} from '@/lib/firestore-service';

interface WebsiteContextType {
  websites: WebsiteConfig[];
  currentSite: WebsiteConfig | null;
  currentSiteId: string;
  setCurrentSiteId: (id: string) => void;
  isLoading: boolean;
  workplace: Workplace | null;
  refreshWebsites: () => Promise<void>;
  createWebsite: (name: string, domain: string) => Promise<WebsiteConfig | null>;
  updateWebsite: (updates: Partial<WebsiteConfig>) => Promise<WebsiteConfig | null>;
  updateWorkplacePlan: (plan: SubscriptionPlanId, billingCycle?: BillingCycle) => Promise<boolean>;
  /**
   * Called from /onboarding Step 1. Creates the user's first real site doc
   * and stamps workplace.onboardedAt in Firestore. Replaces the old pattern
   * of calling updateWebsite() on a pre-created placeholder site.
   */
  completeOnboarding: (name: string, domain: string) => Promise<WebsiteConfig | null>;
}

const defaultSite: WebsiteConfig = {
  id: 'site_default',
  name: 'AI Front-Desk Assistant',
  domain: 'mywebsite.com',
  allowedDomains: ['mywebsite.com', 'localhost', '127.0.0.1'],
  apiKey: 'pk_live_default',
  theme: 'dark',
  primaryColor: '#536df4',
  textColor: '#ffffff',
  backgroundColor: '#0f172a',
  position: 'bottom-right',
  welcomeMessage: '👋 Welcome! How can I assist you today?',
  botName: 'AI Copilot',
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
  launcherAnimation: 'none',
  launcherTheme: 'solid',
  enableParticleTrail: false,
  enableLoadingWaves: false,
  borderRadius: 16,
  fontFamily: 'Inter, system-ui, sans-serif',
  customCss: '',
  onlineStatus: 'online',
  offlineMessage: 'We are currently offline. Leave your email and our team will follow up!',
  leadFormEnabled: true,
  leadFormTitle: 'Want personalized onboarding?',
  leadFields: { name: true, email: true, phone: false, company: true },
  model: 'gemini-1.5-flash',
  systemPrompt: 'You are an AI Customer Support Assistant. Be helpful, concise, and professional.',
  temperature: 0.3,
  maxTokens: 512,
  restrictedTopics: [],
  suggestedQuestions: ['What features do you offer?', 'Pricing details', 'How to contact support?'],
  handoffEnabled: true,
  handoffTriggerWords: ['human', 'agent', 'support rep'],
  rateLimitPerMin: 60,
  domainVerificationSecret: 'sec_verify_default',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const WebsiteContext = createContext<WebsiteContextType>({
  websites: [defaultSite],
  currentSite: defaultSite,
  currentSiteId: 'site_default',
  setCurrentSiteId: () => {},
  isLoading: true,
  workplace: null,
  refreshWebsites: async () => {},
  createWebsite: async () => null,
  updateWebsite: async () => null,
  updateWorkplacePlan: async () => false,
  completeOnboarding: async () => null,
});

export function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<WebsiteConfig[]>([defaultSite]);
  const [currentSiteId, setCurrentSiteIdState] = useState<string>('site_default');
  const [workplace, setWorkplace] = useState<Workplace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync user's workplace websites from Firestore (default) database
  useEffect(() => {
    async function loadUserWorkplace() {
      if (user) {
        setIsLoading(true);
        try {
          const wp = await getOrCreateUserWorkplace(user.uid, user.email || '');
          setWorkplace(wp);

          const userSites = await getUserWebsitesFromFirestore(user.uid, wp.id);
          // For new users who have not yet completed /onboarding Step 1,
          // userSites will be empty (no websites doc written yet). We keep
          // the array empty so the dashboard guard can detect the
          // un-onboarded state without relying on a placeholder domain check.
          // Legacy accounts mid-migration may still fall back to wp.websiteConfig.
          const allSites =
            userSites.length > 0
              ? userSites
              : wp.websiteConfig
              ? [wp.websiteConfig]
              : [];

          setWebsites(allSites);

          if (allSites.length > 0) {
            const savedSiteId = localStorage.getItem('active_website_id');
            const targetSiteId = savedSiteId && allSites.some(s => s.id === savedSiteId) ? savedSiteId : allSites[0].id;
            setCurrentSiteIdState(targetSiteId);
            localStorage.setItem('active_website_id', targetSiteId);
          }
        } catch (err) {
          console.error('Failed loading user workplace from Firestore:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        const savedSiteId = localStorage.getItem('active_website_id');
        if (savedSiteId) {
          setCurrentSiteIdState(savedSiteId);
        }
        refreshWebsites();
      }
    }

    loadUserWorkplace();
  }, [user]);

  const setCurrentSiteId = (id: string) => {
    setCurrentSiteIdState(id);
    localStorage.setItem('active_website_id', id);
    if (user) {
      switchUserWorkplaceInFirestore(user.uid, id).catch((err) => {
        console.error('Error updating active workplace in Firestore:', err);
      });
    }
  };

  const refreshWebsites = async () => {
    if (user && workplace) {
      try {
        setIsLoading(true);
        const userSites = await getUserWebsitesFromFirestore(user.uid, workplace.id);
        if (userSites.length > 0) {
          setWebsites(userSites);
        } else if (workplace.websiteConfig) {
          setWebsites([workplace.websiteConfig]);
        }
      } catch (err) {
        console.error('Error refreshing Firestore workplace website:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/website?websiteId=${currentSiteId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          setWebsites((prev) => {
            const idx = prev.findIndex((w) => w.id === data.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = data;
              return updated;
            }
            return [...prev, data];
          });
        }
      }
    } catch (err) {
      console.error('Error loading website context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createWebsite = async (name: string, domain: string): Promise<WebsiteConfig | null> => {
    try {
      let newSite: WebsiteConfig;

      if (user) {
        const { workplace: newWp, website: createdSite } = await createNewWorkplaceWithWebsite(
          user.uid,
          user.email || '',
          name,
          domain
        );
        newSite = createdSite;
        setWorkplace(newWp);
      } else {
        const newId = `wp_${Date.now()}`;
        newSite = {
          ...defaultSite,
          id: newId,
          workplaceId: newId,
          name,
          domain,
          allowedDomains: [domain, 'localhost', '127.0.0.1'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      await fetch('/api/v1/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSite),
      });

      setWebsites((prev) => [...prev, newSite]);
      setCurrentSiteId(newSite.id);
      return newSite;
    } catch (err) {
      console.error('Error creating new website:', err);
    }
    return null;
  };

  const updateWebsite = async (updates: Partial<WebsiteConfig>): Promise<WebsiteConfig | null> => {
    try {
      const targetId = currentSiteId || workplace?.id || 'site_default';

      // Previously this always wrote to `workplaces/{workplace.id}`
      // regardless of which site was actually being edited — meaning if
      // you had multiple sites and edited any site other than the default
      // one, this line would silently overwrite the DEFAULT site's config
      // with the other site's updates. Now it always targets the exact
      // site being edited (targetId), matching what the API call below does.
      let updatedConfig: WebsiteConfig | null = null;
      if (user) {
        updatedConfig = await updateWebsiteInFirestore(targetId, updates);
      }

      // Always POST to API endpoint too so server-side db.ts cache/Firestore
      // write stays in sync (single collection now, so this and the direct
      // client write above target the same doc — redundant but harmless,
      // and keeps working if the client write is ever removed).
      const res = await fetch('/api/v1/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId, ...updates }),
      });

      const resolvedConfig: WebsiteConfig | null = res.ok
        ? (await res.json())?.website ?? updatedConfig
        : updatedConfig;

      if (resolvedConfig) {
        // Update only the edited site within the list — never collapse the
        // whole `websites` array down to one entry.
        setWebsites((prev) => {
          const idx = prev.findIndex((w) => w.id === targetId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = resolvedConfig;
            return next;
          }
          return [...prev, resolvedConfig];
        });
      }

      return resolvedConfig;
    } catch (err) {
      console.error('Error updating website config:', err);
    }
    return null;
  };

  const completeOnboarding = async (name: string, domain: string): Promise<WebsiteConfig | null> => {
    if (!user) {
      throw new Error('You must be signed in to finish onboarding.');
    }
    try {
      // `workplace` may not have finished loading yet — the initial
      // getOrCreateUserWorkplace() fetch in the effect above is async, and
      // the onboarding submit button isn't gated on it. Previously this
      // function silently returned null in that case: onboardedAt never
      // got stamped, the __onboarded cookie never got refreshed, and the
      // UI still advanced to step 2 as if it had succeeded — leaving the
      // user stuck bouncing between /dashboard and /onboarding forever.
      // Resolve the workplace on-demand instead of bailing.
      let wp = workplace;
      if (!wp) {
        wp = await getOrCreateUserWorkplace(user.uid, user.email || '');
        setWorkplace(wp);
      }

      const { workplace: updatedWp, website } = await completeOnboardingInFirestore(
        user.uid,
        wp.id,
        name,
        domain
      );
      // Stamp onboardedAt locally so the client-side context is consistent.
      setWorkplace({ ...wp, ...updatedWp });
      setWebsites([website]);
      setCurrentSiteIdState(website.id);
      localStorage.setItem('active_website_id', website.id);

      // Refresh the __session + __onboarded cookies via the server-side
      // session endpoint BEFORE navigating to /dashboard. The middleware
      // checks __onboarded on every /dashboard/* request, so this must
      // complete first — otherwise the middleware still sees __onboarded=0
      // and bounces the user back to /onboarding.
      try {
        const idToken = await user.getIdToken(/* forceRefresh */ true);
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
      } catch (cookieErr) {
        console.error('[completeOnboarding] Failed to refresh session cookie:', cookieErr);
        // Non-fatal: the auth-context onIdTokenChanged listener will
        // retry the sync on the next token rotation.
      }

      return website;
    } catch (err) {
      console.error('Error completing onboarding in Firestore:', err);
      // Rethrow (rather than returning null) so the /onboarding page's
      // try/catch actually sees the failure and surfaces an error instead
      // of silently advancing to step 2 as if onboarding had succeeded.
      throw err;
    }
  };

  const updateWorkplacePlan = async (
    plan: SubscriptionPlanId,
    billingCycle?: BillingCycle
  ): Promise<boolean> => {
    if (!workplace) return false;
    try {
      const ok = await updateWorkplacePlanInFirestore(workplace.id, plan, billingCycle);
      if (ok) {
        setWorkplace((prev) =>
          prev
            ? {
                ...prev,
                plan,
                ...(billingCycle ? { planBillingCycle: billingCycle } : {}),
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        return true;
      }
    } catch (err) {
      console.error('Error updating workplace plan in context:', err);
    }
    return false;
  };

  const currentSite = websites.find((w) => w.id === currentSiteId) || websites[0] || null;

  return (
    <WebsiteContext.Provider
      value={{
        websites,
        currentSite,
        currentSiteId,
        setCurrentSiteId,
        isLoading,
        workplace,
        refreshWebsites,
        createWebsite,
        updateWebsite,
        updateWorkplacePlan,
        completeOnboarding,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  return useContext(WebsiteContext);
}
