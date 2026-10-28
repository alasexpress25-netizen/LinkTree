import React, { useState } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { LinkItem, ThemeConfig } from '../types';
import { IconRenderer } from './IconRenderer';

interface LinkButtonProps {
  link: LinkItem;
  theme: ThemeConfig;
  onClick: (link: LinkItem) => void;
  showClickCount?: boolean;
}

const BADGE_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  rose: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
  red: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/40' },
};

export const LinkButton: React.FC<LinkButtonProps> = ({
  link,
  theme,
  onClick,
  showClickCount = false,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    onClick(link);
  };

  // Determine container styling based on theme
  let cardClass = '';
  const inlineStyle: React.CSSProperties = {
    color: theme.cardTextColor || '#ffffff',
  };

  switch (theme.cardStyle) {
    case 'glass':
      cardClass = 'bg-white/10 backdrop-blur-md hover:bg-white/15 border';
      inlineStyle.borderColor = theme.cardBorderColor || 'rgba(255, 255, 255, 0.2)';
      break;
    case 'solid':
      cardClass = 'border hover:brightness-110';
      inlineStyle.backgroundColor = theme.cardBgColor || '#1e293b';
      inlineStyle.borderColor = theme.cardBorderColor || '#334155';
      break;
    case 'neon':
      cardClass = 'bg-slate-900/90 border hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]';
      inlineStyle.borderColor = theme.cardBorderColor || '#a855f7';
      break;
    case 'soft-shadow':
      cardClass = 'bg-white text-slate-900 shadow-md hover:shadow-xl border border-slate-200';
      break;
    case 'border-only':
      cardClass = 'bg-transparent border-2 hover:bg-white/5';
      inlineStyle.borderColor = theme.accentColor || '#f59e0b';
      break;
    default:
      cardClass = 'bg-white/10 backdrop-blur-md hover:bg-white/15 border';
      inlineStyle.borderColor = theme.cardBorderColor || 'rgba(255, 255, 255, 0.2)';
  }

  // Animation classes
  let animClass = '';
  if (link.animation === 'pulse') animClass = 'animate-pulse';
  if (link.animation === 'bounce') animClass = 'animate-bounce';

  const badgeStyle = link.badge
    ? BADGE_COLOR_MAP[link.badge.color] || BADGE_COLOR_MAP.amber
    : null;

  return (
    <a
      href={link.url}
      onClick={handleClick}
      rel="noopener noreferrer"
      className={`group relative flex items-center justify-between w-full p-4 mb-3.5 transition-all duration-300 cursor-pointer select-none ${
        theme.borderRadius
      } ${cardClass} ${animClass} ${
        isClicked ? 'scale-95' : 'hover:scale-[1.02]'
      } active:scale-95`}
      style={inlineStyle}
    >
      {/* Glow highlight effect if enabled */}
      {link.animation === 'glow' && (
        <div
          className="absolute -inset-0.5 rounded-[inherit] blur-sm opacity-50 group-hover:opacity-100 transition duration-300 -z-10"
          style={{ backgroundColor: theme.accentColor }}
        />
      )}

      {/* Left Icon with round backdrop */}
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: `1px solid ${theme.cardBorderColor || 'rgba(255, 255, 255, 0.15)'}`,
            color: theme.accentColor || '#f59e0b',
          }}
        >
          <IconRenderer name={link.icon} className="w-5 h-5" />
        </div>

        {/* Texts */}
        <div className="flex flex-col text-left min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-semibold text-sm sm:text-base leading-tight tracking-tight truncate ${
                theme.fontStyle === 'serif' ? 'font-serif' : 'font-sans'
              }`}
            >
              {link.title}
            </span>

            {/* Badge */}
            {link.badge && badgeStyle && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {link.badge.text}
              </span>
            )}
          </div>

          {link.subtitle && (
            <span className="text-xs opacity-75 mt-0.5 line-clamp-1 font-normal">
              {link.subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right meta: external icon and/or live click counter */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {showClickCount && (
          <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono rounded-full bg-black/30 border border-white/10 opacity-70">
            {link.clicks || 0} clics
          </span>
        )}
        <div
          className="flex items-center justify-center w-7 h-7 rounded-full bg-black/20 group-hover:bg-white/20 transition-colors opacity-70 group-hover:opacity-100"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
};
