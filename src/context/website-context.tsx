'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteConfig } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { getOrCreateUserWorkplace, updateWorkplaceWebsiteInFirestore, Workplace } from '@/lib/firestore-service';

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
  welcomeMessage: "👋 Hello! How can I help you today?",
  botName: 'AI Assistant',
  botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
  launcherIcon: 'sparkles',
  launcherStyle: 'bar',
  launcherText: 'Ask AI anything...',
  launcherPlaceholder: 'Type your question...',
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
  leadFormTitle: 'Leave your contact info',
  leadFields: { name: true, email: true, phone: false, company: true },
  model: 'gemini-1.5-flash',
  systemPrompt: 'You are a helpful AI customer support assistant.',
  temperature: 0.3,
  maxTokens: 512,
  restrictedTopics: [],
  suggestedQuestions: ['What services do you offer?', 'How can I contact support?'],
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
  isLoading: false,
  workplace: null,
  refreshWebsites: async () => {},
  createWebsite: async () => null,
  updateWebsite: async () => null,
});

export function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<WebsiteConfig[]>([defaultSite]);
  const [currentSiteId, setCurrentSiteIdState] = useState<string>('site_default');
  const [workplace, setWorkplace] = useState<Workplace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync user's workplace website from Firestore (default) database
  useEffect(() => {
    async function loadUserWorkplace() {
      if (user) {
        setIsLoading(true);
        try {
          const wp = await getOrCreateUserWorkplace(user.uid, user.email || '');
          setWorkplace(wp);
          setWebsites([wp.websiteConfig]);
          setCurrentSiteIdState(wp.websiteConfig.id);
          localStorage.setItem('active_website_id', wp.websiteConfig.id);
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
  };

  const refreshWebsites = async () => {
    if (user && workplace) {
      try {
        setIsLoading(true);
        const wp = await getOrCreateUserWorkplace(user.uid, user.email || '');
        setWorkplace(wp);
        setWebsites([wp.websiteConfig]);
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
    // 1 website per workplace rule: update existing workplace website or create/update in Firestore
    if (workplace) {
      const updated = await updateWebsite({ name, domain, allowedDomains: [domain, 'localhost', '127.0.0.1'] });
      return updated;
    }

    try {
      const newId = `site_${Date.now()}`;
      const newSite: WebsiteConfig = {
        ...defaultSite,
        id: newId,
        name,
        domain,
        allowedDomains: [domain, 'localhost', '127.0.0.1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/v1/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSite),
      });

      if (res.ok) {
        setWebsites((prev) => [...prev, newSite]);
        setCurrentSiteId(newId);
        return newSite;
      }
    } catch (err) {
      console.error('Error creating new website:', err);
    }
    return null;
  };

  const updateWebsite = async (updates: Partial<WebsiteConfig>): Promise<WebsiteConfig | null> => {
    if (workplace) {
      const updatedConfig = await updateWorkplaceWebsiteInFirestore(workplace.id, updates);
      if (updatedConfig) {
        setWorkplace({ ...workplace, websiteConfig: updatedConfig });
        setWebsites([updatedConfig]);
        return updatedConfig;
      }
    }

    try {
      const res = await fetch('/api/v1/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentSiteId, ...updates }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.website) {
          setWebsites((prev) => prev.map((w) => (w.id === currentSiteId ? data.website : w)));
          return data.website;
        }
      }
    } catch (err) {
      console.error('Error updating website config:', err);
    }
    return null;
  };

  const currentSite = websites.find((w) => w.id === currentSiteId) || websites[0] || defaultSite;

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
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  return useContext(WebsiteContext);
}
