import React from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../utils/youtube';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  subtitle?: string;
  tag?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  subtitle,
  tag,
}) => {
  if (!isOpen) return null;

  const youtubeId = extractYouTubeId(videoUrl);
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 min-w-0 pr-4">
            {tag && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider shrink-0">
                {tag}
              </span>
            )}
            <h3 className="text-sm sm:text-base font-bold text-white truncate">{title}</h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition-colors border border-slate-700"
              title="Abrir en YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver en YouTube</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full bg-black aspect-video flex items-center justify-center">
          {youtubeId ? (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-6 space-y-3">
              <p className="text-sm text-slate-300">
                Este video no es un enlace embebible de YouTube directo.
              </p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir enlace del video ({videoUrl})</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer info */}
        {subtitle && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>{subtitle}</span>
            <span className="text-[11px] text-amber-400/80 font-mono">El Amor Traspasa • Transmisión</span>
          </div>
        )}
      </div>
    </div>
  );
};
