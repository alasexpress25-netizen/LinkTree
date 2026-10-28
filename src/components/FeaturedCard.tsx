import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import { ProfileConfig, ThemeConfig } from '../types';

interface FeaturedCardProps {
  media: ProfileConfig['featuredMedia'];
  theme: ThemeConfig;
  onClick: () => void;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({ media, theme, onClick }) => {
  if (!media || !media.enabled) return null;

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-5">
      <div
        onClick={onClick}
        className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-xl border"
        style={{
          borderColor: theme.cardBorderColor || 'rgba(255, 255, 255, 0.2)',
          background: 'rgba(15, 23, 42, 0.6)',
        }}
      >
        {/* Background Image with Dark Vignette */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden">
          <img
            src={media.thumbnailUrl}
            alt={media.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Tag Badge */}
          {media.tag && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/90 text-slate-950 shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>{media.tag}</span>
            </div>
          )}

          {/* Central Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: theme.accentColor || '#f59e0b',
                color: '#0f172a',
              }}
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Content footer */}
        <div className="p-4 bg-slate-950/90 backdrop-blur-md">
          <h3
            className="text-base sm:text-lg font-bold line-clamp-1 group-hover:text-amber-400 transition-colors"
            style={{ color: theme.cardTextColor }}
          >
            {media.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-normal">
            {media.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
