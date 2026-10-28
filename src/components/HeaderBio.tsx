import React from 'react';
import { BadgeCheck, MapPin, Share2 } from 'lucide-react';
import { ProfileConfig, ThemeConfig } from '../types';
import { IconRenderer } from './IconRenderer';

interface HeaderBioProps {
  profile: ProfileConfig;
  theme: ThemeConfig;
  onOpenShare: () => void;
  onSocialClick: (platform: string, url: string) => void;
}

export const HeaderBio: React.FC<HeaderBioProps> = ({
  profile,
  theme,
  onOpenShare,
  onSocialClick,
}) => {
  return (
    <header className="relative flex flex-col items-center text-center px-4 pt-8 pb-4 w-full max-w-xl mx-auto">
      {/* Share profile top action */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onOpenShare}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-md"
          title="Compartir o ver QR"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Avatar Container with glowing aura */}
      <div className="relative mb-4 group cursor-pointer" onClick={onOpenShare}>
        <div
          className="absolute -inset-1.5 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse-slow"
          style={{
            background: `radial-gradient(circle, ${theme.accentColor} 0%, transparent 70%)`,
          }}
        />

        <div
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 shadow-2xl transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${theme.accentColor}, #ffffff 60%, ${theme.accentColor})`,
          }}
        >
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-full h-full object-cover rounded-full bg-slate-900 border-2 border-slate-950"
            onError={(e) => {
              // fallback if image fails
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {profile.verified && (
          <div
            className="absolute bottom-1 right-1 p-1 rounded-full bg-slate-950 shadow-lg border border-amber-400/40"
            title={profile.customTexts?.verifiedBadgeText || 'Cuenta Oficial Verificada'}
          >
            <BadgeCheck className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          </div>
        )}
      </div>

      {/* Name and Handle */}
      <h1
        className={`text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm flex items-center justify-center gap-1.5 ${
          theme.fontStyle === 'serif' ? 'font-serif' : 'font-sans'
        }`}
        style={{ color: theme.cardTextColor }}
      >
        <span>{profile.name}</span>
      </h1>

      <p
        className="text-xs sm:text-sm font-medium mt-1 font-mono tracking-wide opacity-80"
        style={{ color: theme.accentColor }}
      >
        {profile.handle}
      </p>

      {/* Bio text */}
      <p
        className="mt-3 text-xs sm:text-sm max-w-md leading-relaxed px-2 font-normal opacity-90"
        style={{ color: theme.cardTextColor }}
      >
        {profile.bio}
      </p>

      {/* Location / Global Tag */}
      {profile.location && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full text-[11px] font-medium bg-black/25 backdrop-blur-md border border-white/10 text-white/80">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span>{profile.location}</span>
        </div>
      )}

      {/* Social Links Row */}
      {profile.socialLinks && profile.socialLinks.filter((s) => s.active).length > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-2.5 mt-5">
          {profile.socialLinks
            .filter((s) => s.active)
            .map((social) => (
              <button
                key={social.id}
                onClick={() => onSocialClick(social.platform, social.url)}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-115 active:scale-95 shadow-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${theme.cardBorderColor || 'rgba(255, 255, 255, 0.15)'}`,
                  color: theme.cardTextColor,
                }}
                title={social.label}
              >
                <IconRenderer name={social.platform} className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
            ))}
        </div>
      )}
    </header>
  );
};
