import React, { useState } from 'react';
import { X, Copy, Check, Share2, Download, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    url
  )}&color=0f172a&bgcolor=ffffff&qzone=2&format=svg`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Visita ${title} en:`,
          url,
        });
      } catch {
        // user canceled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm p-6 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Share2 className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Compartir Perfil</h3>
        <p className="text-xs text-slate-400 mb-5">
          Escanea el código QR con cualquier teléfono o copia el enlace directo
        </p>

        {/* QR Code Frame */}
        <div className="p-3 bg-white rounded-2xl shadow-inner mx-auto inline-block border-4 border-amber-500/30">
          <img
            src={qrImageUrl}
            alt="Código QR del perfil"
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
            loading="eager"
          />
        </div>

        <div className="mt-4 p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-left">
          <span className="text-xs font-mono text-slate-300 truncate max-w-[200px]">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shrink-0 active:scale-95 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-950" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            Compartir
          </button>

          <a
            href={qrImageUrl}
            download="qrcode-elamortraspasa.svg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Descargar QR
          </a>
        </div>
      </div>
    </div>
  );
};
