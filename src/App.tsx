import React, { useState, useEffect } from 'react';
import {
  Settings,
  Share2,
  QrCode,
  Sparkles,
  BarChart2,
  Heart,
  ExternalLink,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import { LinkItem, ProfileConfig, ThemeConfig, AnalyticsData } from './types';
import { storageService } from './services/storage';
import { HeaderBio } from './components/HeaderBio';
import { FeaturedCard } from './components/FeaturedCard';
import { LinkButton } from './components/LinkButton';
import { AdminModal } from './components/AdminModal';
import { QRCodeModal } from './components/QRCodeModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [profile, setProfile] = useState<ProfileConfig>(storageService.getProfile());
  const [theme, setTheme] = useState<ThemeConfig>(storageService.getTheme());
  const [analytics, setAnalytics] = useState<AnalyticsData>(storageService.getAnalytics());

  // Modals state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Filter category
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load and record visit once
  useEffect(() => {
    const loadedLinks = storageService.getLinks();
    const loadedProfile = storageService.getProfile();
    const loadedTheme = storageService.getTheme();
    const updatedAnalytics = storageService.recordVisit();

    setLinks(loadedLinks);
    setProfile(loadedProfile);
    setTheme(loadedTheme);
    setAnalytics(updatedAnalytics);
  }, []);

  // Dynamically sync PWA icon & favicon if customized in admin
  useEffect(() => {
    if (profile.pwaIconUrl) {
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (appleTouchIcon) appleTouchIcon.href = profile.pwaIconUrl;

      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) favicon.href = profile.pwaIconUrl;
    }
  }, [profile.pwaIconUrl]);

  // Handle Link Click with real-time tracking
  const handleLinkClick = (link: LinkItem) => {
    const { updatedAnalytics, updatedLinks } = storageService.recordClick(link.id, link.title);
    setAnalytics(updatedAnalytics);
    setLinks(updatedLinks);

    // Open target link
    if (link.url) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle Social Click with tracking
  const handleSocialClick = (platform: string, url: string) => {
    const { updatedAnalytics } = storageService.recordClick(`social-${platform}`, `Red Social: ${platform}`);
    setAnalytics(updatedAnalytics);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Simulate click from admin panel
  const handleSimulateClick = (linkId: string) => {
    const link = links.find((l) => l.id === linkId);
    if (link) {
      const { updatedAnalytics, updatedLinks } = storageService.recordClick(link.id, link.title);
      setAnalytics(updatedAnalytics);
      setLinks(updatedLinks);
    }
  };

  // Dynamic Background classes & inline styles
  let bgContainerClass = 'min-h-screen relative flex flex-col justify-between selection:bg-amber-500 selection:text-black';
  let bgInlineStyle: React.CSSProperties = {};

  if (theme.bgType === 'gradient') {
    bgContainerClass += ` bg-gradient-to-b ${theme.bgGradient}`;
  } else if (theme.bgType === 'mesh') {
    bgContainerClass += ` bg-gradient-to-tr ${theme.bgGradient}`;
  } else if (theme.bgType === 'solid') {
    bgInlineStyle.backgroundColor = theme.bgSolidColor || '#0f172a';
  } else if (theme.bgType === 'stars') {
    bgContainerClass += ` bg-gradient-to-b ${theme.bgGradient}`;
  }

  // Filter links
  const visibleLinks = links.filter((l) => l.active);
  const categories = [
    { id: 'all', label: profile.customTexts?.categoryAll || 'Todos' },
    { id: 'community', label: profile.customTexts?.categoryCommunity || 'Comunidad' },
    { id: 'multimedia', label: profile.customTexts?.categoryMultimedia || 'Transmisiones' },
    { id: 'donations', label: profile.customTexts?.categoryDonations || 'Donaciones' },
  ];

  const filteredLinks =
    selectedCategory === 'all'
      ? visibleLinks
      : visibleLinks.filter((l) => (l.category || 'general') === selectedCategory);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://elamortraspasa.com';

  return (
    <div className={bgContainerClass} style={bgInlineStyle}>
      {/* Background Animated Ambient Lights / Glow Spheres */}
      {theme.showBackgroundBubbles && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full blur-[110px] opacity-25 animate-pulse-slow"
            style={{ backgroundColor: theme.accentColor || '#f59e0b' }}
          />
          <div
            className="absolute bottom-10 left-10 w-[24rem] h-[24rem] rounded-full blur-[100px] opacity-20 animate-pulse-slow"
            style={{ backgroundColor: '#ec4899' }}
          />
          <div
            className="absolute top-1/2 right-10 w-[22rem] h-[22rem] rounded-full blur-[120px] opacity-15 animate-pulse-slow"
            style={{ backgroundColor: '#6366f1' }}
          />
        </div>
      )}

      {/* Top Floating Bar for Admin Access & Live Status */}
      <div className="sticky top-0 z-40 w-full px-4 py-3 flex items-center justify-between backdrop-blur-md bg-black/20 border-b border-white/5 max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono text-white/70">
            {analytics.totalClicks.toLocaleString()} {profile.customTexts?.topBarLiveBadge || 'clics en vivo'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Gear icon button with prominent admin label & tooltip */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
            title="Abrir Panel de Configuración y Seguridad"
          >
            <Settings className="w-3.5 h-3.5 animate-spin-slow" />
            <span>{profile.customTexts?.topBarButtonText || 'Configurar'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Hub */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pb-12">
        {/* Profile Header with Avatar, Verified badge, and Social Icons */}
        <HeaderBio
          profile={profile}
          theme={theme}
          onOpenShare={() => setIsShareOpen(true)}
          onSocialClick={handleSocialClick}
        />

        {/* Featured Video / Highlight Banner Card */}
        {profile.featuredMedia?.enabled && (
          <FeaturedCard
            media={profile.featuredMedia}
            theme={theme}
            onClick={() => {
              if (profile.featuredMedia?.videoUrl) {
                storageService.recordClick('featured-media', profile.featuredMedia.title);
                if (profile.featuredMedia.embedMode === 'newTab') {
                  window.open(profile.featuredMedia.videoUrl, '_blank', 'noopener,noreferrer');
                } else {
                  setIsVideoModalOpen(true);
                }
              }
            }}
          />
        )}

        {/* Category Pills (Subtle Filter) */}
        {visibleLinks.some((l) => l.category) && (
          <div className="flex items-center justify-center gap-1.5 my-4 px-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white/20 text-white font-bold backdrop-blur-md border border-white/20 shadow-sm'
                    : 'bg-black/20 text-white/60 hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Primary Links Stack */}
        <div className="w-full mt-3 space-y-1">
          {filteredLinks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-black/20 border border-white/10 text-white/60 text-xs">
              {profile.customTexts?.emptyStateText || 'No hay enlaces en esta categoría.'}
            </div>
          ) : (
            filteredLinks.map((link) => (
              <LinkButton
                key={link.id}
                link={link}
                theme={theme}
                onClick={handleLinkClick}
                showClickCount={false}
              />
            ))
          )}
        </div>

        {/* Quick Help, PWA & Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <PWAInstallButton variant="pill" />

          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>{profile.customTexts?.shareModalButtonText || 'Ver Código QR & Compartir'}</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 text-center border-t border-white/5 bg-black/30 backdrop-blur-md text-slate-400 text-xs">
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center gap-2">
          <p className="opacity-90">{profile.footerText}</p>

          <div className="flex items-center gap-3 text-[11px] opacity-70">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>Panel Administrador</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>{analytics.totalClicks} clics totales</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        links={links}
        profile={profile}
        theme={theme}
        analytics={analytics}
        onUpdateLinks={setLinks}
        onUpdateProfile={setProfile}
        onUpdateTheme={setTheme}
        onUpdateAnalytics={setAnalytics}
        onSimulateClick={handleSimulateClick}
      />

      {/* QR Code and Share Modal */}
      <QRCodeModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={currentUrl}
        title={profile.name}
      />

      {/* Video Player Modal */}
      {profile.featuredMedia?.videoUrl && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={profile.featuredMedia.videoUrl}
          title={profile.featuredMedia.title}
          subtitle={profile.featuredMedia.subtitle}
          tag={profile.featuredMedia.tag}
        />
      )}

      {/* PWA Offline Connection Indicator */}
      <OfflineIndicator />
    </div>
  );
}
