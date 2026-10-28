import React, { useState } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'pill' | 'header' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on the home screen, hide the button
  if (isInstalled) {
    return null;
  }

  // Handle click
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions / browser guidance modal
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' ? (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${className}`}
          title="Instalar como App en tu teléfono o PC"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>
      ) : variant === 'card' ? (
        <div
          onClick={handleClick}
          className={`flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 transition-all cursor-pointer group active:scale-[0.98] ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">Instalar Aplicación en tu Pantalla</div>
              <div className="text-[11px] text-slate-400">Accede rápido sin abrir el navegador • Funciona offline</div>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 shrink-0">
            Instalar
          </span>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white backdrop-blur-md border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Instalar en tu Celular</span>
        </button>
      )}

      {/* Guided installation modal for iOS / manual browsers */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-center">
          <div className="relative w-full max-w-sm p-6 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-200">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Instalar en tu Dispositivo
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Agrega esta página a tu pantalla de inicio para abrirla como una aplicación nativa.
            </p>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400 shrink-0 mt-0.5">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <strong>Paso 1:</strong> Pulsa el botón <strong>Compartir</strong> (o el menú de opciones de tu navegador).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 shrink-0 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <strong>Paso 2:</strong> Desplázate hacia abajo y selecciona <strong>&quot;Agregar a la pantalla de inicio&quot;</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md cursor-pointer"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
