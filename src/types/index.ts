export type IconName =
  | 'whatsapp'
  | 'youtube'
  | 'instagram'
  | 'music'
  | 'heart'
  | 'globe'
  | 'calendar'
  | 'dollar'
  | 'book'
  | 'message'
  | 'video'
  | 'mail'
  | 'phone'
  | 'sparkles'
  | 'star'
  | 'mapPin'
  | 'share';

export type ButtonAnimation = 'none' | 'pulse' | 'glow' | 'bounce';

export interface LinkItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon: IconName;
  badge?: {
    text: string;
    color: 'amber' | 'rose' | 'emerald' | 'blue' | 'purple' | 'red';
  };
  animation: ButtonAnimation;
  active: boolean;
  clicks: number;
  isPinned?: boolean;
  category?: 'general' | 'social' | 'community' | 'donations' | 'multimedia';
}

export interface SocialLink {
  id: string;
  platform: 'whatsapp' | 'instagram' | 'youtube' | 'tiktok' | 'spotify' | 'facebook' | 'email' | 'phone' | 'globe';
  label: string;
  url: string;
  active: boolean;
}

export interface CustomTextsConfig {
  topBarButtonText?: string;
  topBarLiveBadge?: string;
  shareModalButtonText?: string;
  categoryAll?: string;
  categoryCommunity?: string;
  categoryMultimedia?: string;
  categoryDonations?: string;
  emptyStateText?: string;
  verifiedBadgeText?: string;
}

export interface ProfileConfig {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  location: string;
  footerText: string;
  featuredMedia?: {
    enabled: boolean;
    title: string;
    subtitle: string;
    tag: string;
    videoUrl: string;
    thumbnailUrl: string;
    embedMode?: 'popup' | 'newTab';
  };
  socialLinks: SocialLink[];
  customTexts?: CustomTextsConfig;
}

export type ThemePresetId = 'elamor' | 'celestial' | 'oasis' | 'midnight' | 'minimal' | 'sunset' | 'custom';

export interface ThemeConfig {
  presetId: ThemePresetId;
  bgType: 'gradient' | 'mesh' | 'solid' | 'stars';
  bgGradient: string;
  bgSolidColor: string;
  cardStyle: 'glass' | 'solid' | 'neon' | 'soft-shadow' | 'border-only';
  cardBgColor: string;
  cardTextColor: string;
  cardBorderColor: string;
  accentColor: string;
  borderRadius: 'rounded-xl' | 'rounded-2xl' | 'rounded-full' | 'rounded-lg';
  fontStyle: 'sans' | 'serif';
  buttonHoverEffect: 'scale' | 'glow' | 'slide';
  showBackgroundBubbles: boolean;
}

export interface AnalyticsEvent {
  id: string;
  linkId: string;
  linkTitle: string;
  timestamp: number;
  device: 'mobile' | 'desktop' | 'tablet';
  referrer: 'WhatsApp' | 'Instagram' | 'Directo' | 'TikTok' | 'YouTube' | 'Google';
}

export interface AnalyticsData {
  totalVisits: number;
  totalClicks: number;
  recentEvents: AnalyticsEvent[];
  referrerCounts: Record<string, number>;
  deviceCounts: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}
