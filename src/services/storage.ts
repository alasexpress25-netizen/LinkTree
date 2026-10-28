import { LinkItem, ProfileConfig, ThemeConfig, AnalyticsData, AnalyticsEvent } from '../types';
import { DEFAULT_LINKS, DEFAULT_PROFILE, THEME_PRESETS, INITIAL_ANALYTICS } from '../data/defaultData';

const STORAGE_KEYS = {
  LINKS: 'elamor_biolink_links_v1',
  PROFILE: 'elamor_biolink_profile_v1',
  THEME: 'elamor_biolink_theme_v1',
  PASSWORD: 'elamor_biolink_admin_pwd_v1',
  ANALYTICS: 'elamor_biolink_analytics_v1',
};

const DEFAULT_PASSWORD = 'admin123';

export const storageService = {
  getLinks(): LinkItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LINKS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading links from localStorage', e);
    }
    return DEFAULT_LINKS;
  },

  saveLinks(links: LinkItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
    } catch (e) {
      console.error('Error saving links', e);
    }
  },

  getProfile(): ProfileConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          customTexts: {
            ...DEFAULT_PROFILE.customTexts,
            ...(parsed.customTexts || {}),
          },
          companyBranding: {
            ...DEFAULT_PROFILE.companyBranding,
            ...(parsed.companyBranding || {}),
          },
        };
      }
    } catch (e) {
      console.error('Error loading profile', e);
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: ProfileConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile', e);
    }
  },

  getTheme(): ThemeConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading theme', e);
    }
    return THEME_PRESETS.elamor;
  },

  saveTheme(theme: ThemeConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    } catch (e) {
      console.error('Error saving theme', e);
    }
  },

  getPassword(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PASSWORD);
      if (stored) {
        return stored;
      }
    } catch (e) {
      console.error('Error loading password', e);
    }
    return DEFAULT_PASSWORD;
  },

  savePassword(newPassword: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PASSWORD, newPassword);
    } catch (e) {
      console.error('Error saving password', e);
    }
  },

  verifyPassword(input: string): boolean {
    const current = this.getPassword();
    return input.trim() === current.trim();
  },

  getAnalytics(): AnalyticsData {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading analytics', e);
    }
    return INITIAL_ANALYTICS;
  },

  saveAnalytics(data: AnalyticsData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving analytics', e);
    }
  },

  recordVisit(): AnalyticsData {
    const current = this.getAnalytics();
    const updated: AnalyticsData = {
      ...current,
      totalVisits: (current.totalVisits || 0) + 1,
    };
    this.saveAnalytics(updated);
    return updated;
  },

  recordClick(linkId: string, linkTitle: string): { updatedAnalytics: AnalyticsData; updatedLinks: LinkItem[] } {
    const currentAnalytics = this.getAnalytics();
    const currentLinks = this.getLinks();

    // Determine device
    const width = typeof window !== 'undefined' ? window.innerWidth : 768;
    const device: 'mobile' | 'desktop' | 'tablet' = width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';

    // Simulate / detect referrer pool
    const referrers: Array<'WhatsApp' | 'Instagram' | 'Directo' | 'TikTok' | 'YouTube' | 'Google'> = [
      'WhatsApp', 'Instagram', 'Directo', 'TikTok', 'YouTube', 'Google'
    ];
    const randomReferrer = referrers[Math.floor(Math.random() * referrers.length)];

    const newEvent: AnalyticsEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      linkId,
      linkTitle,
      timestamp: Date.now(),
      device,
      referrer: randomReferrer,
    };

    const updatedLinks = currentLinks.map(l => {
      if (l.id === linkId) {
        return { ...l, clicks: (l.clicks || 0) + 1 };
      }
      return l;
    });

    const updatedAnalytics: AnalyticsData = {
      ...currentAnalytics,
      totalClicks: (currentAnalytics.totalClicks || 0) + 1,
      recentEvents: [newEvent, ...(currentAnalytics.recentEvents || [])].slice(0, 30),
      deviceCounts: {
        ...currentAnalytics.deviceCounts,
        [device]: (currentAnalytics.deviceCounts?.[device] || 0) + 1,
      },
      referrerCounts: {
        ...currentAnalytics.referrerCounts,
        [randomReferrer]: (currentAnalytics.referrerCounts?.[randomReferrer] || 0) + 1,
      },
    };

    this.saveLinks(updatedLinks);
    this.saveAnalytics(updatedAnalytics);

    return { updatedAnalytics, updatedLinks };
  },

  resetAnalytics(): { freshAnalytics: AnalyticsData; resetLinks: LinkItem[] } {
    const freshAnalytics: AnalyticsData = {
      totalVisits: 0,
      totalClicks: 0,
      recentEvents: [],
      referrerCounts: {
        WhatsApp: 0,
        Instagram: 0,
        Directo: 0,
        TikTok: 0,
        YouTube: 0,
        Google: 0,
      },
      deviceCounts: {
        mobile: 0,
        desktop: 0,
        tablet: 0,
      },
    };
    this.saveAnalytics(freshAnalytics);

    const currentLinks = this.getLinks();
    const resetLinks = currentLinks.map((l) => ({ ...l, clicks: 0 }));
    this.saveLinks(resetLinks);

    return { freshAnalytics, resetLinks };
  },

  resetAllToDefault(): {
    links: LinkItem[];
    profile: ProfileConfig;
    theme: ThemeConfig;
    password: string;
    analytics: AnalyticsData;
  } {
    this.saveLinks(DEFAULT_LINKS);
    this.saveProfile(DEFAULT_PROFILE);
    this.saveTheme(THEME_PRESETS.elamor);
    this.savePassword(DEFAULT_PASSWORD);
    this.saveAnalytics(INITIAL_ANALYTICS);

    return {
      links: DEFAULT_LINKS,
      profile: DEFAULT_PROFILE,
      theme: THEME_PRESETS.elamor,
      password: DEFAULT_PASSWORD,
      analytics: INITIAL_ANALYTICS,
    };
  },

  exportFullBackup(): string {
    const data = {
      profile: this.getProfile(),
      links: this.getLinks(),
      theme: this.getTheme(),
      analytics: this.getAnalytics(),
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveProfile(data.profile);
      if (Array.isArray(data.links)) this.saveLinks(data.links);
      if (data.theme) this.saveTheme(data.theme);
      if (data.analytics) this.saveAnalytics(data.analytics);
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  },
};
