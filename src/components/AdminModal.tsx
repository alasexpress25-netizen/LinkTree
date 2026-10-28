import React, { useState } from 'react';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  LayoutGrid,
  Palette,
  BarChart3,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Download,
  Upload,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Users,
  MousePointerClick,
  Smartphone,
  Monitor,
  Tablet,
  Share2,
  Type,
  FileText,
  RotateCcw,
  Video,
  Play,
  Wand2,
  MessageCircle,
  Phone,
  Mail,
} from 'lucide-react';
import {
  LinkItem,
  ProfileConfig,
  ThemeConfig,
  AnalyticsData,
  IconName,
  ButtonAnimation,
  ThemePresetId,
  CustomTextsConfig,
  SocialLink,
} from '../types';
import { storageService } from '../services/storage';
import { AVAILABLE_ICONS, IconRenderer } from './IconRenderer';
import { THEME_PRESETS } from '../data/defaultData';
import { extractYouTubeId, getYouTubeThumbnail, formatSocialUrl } from '../utils/youtube';
import { downloadPwaIconSet } from '../utils/pwaIcons';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: LinkItem[];
  profile: ProfileConfig;
  theme: ThemeConfig;
  analytics: AnalyticsData;
  onUpdateLinks: (links: LinkItem[]) => void;
  onUpdateProfile: (profile: ProfileConfig) => void;
  onUpdateTheme: (theme: ThemeConfig) => void;
  onUpdateAnalytics: (analytics: AnalyticsData) => void;
  onSimulateClick: (linkId: string) => void;
}

type TabType = 'analytics' | 'links' | 'video' | 'social' | 'texts' | 'appearance' | 'security' | 'backup';

const AVATAR_PRESETS = [
  {
    name: 'El Amor Traspasa',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Comunidad & Luz',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Retiro & Alabanza',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cruz Dorada Minimal',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=400&auto=format&fit=crop&q=80',
  },
];

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  links,
  profile,
  theme,
  analytics,
  onUpdateLinks,
  onUpdateProfile,
  onUpdateTheme,
  onUpdateAnalytics,
  onSimulateClick,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('video');

  // Confirmation Modals State (In-app, no window.confirm!)
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  const [showFactoryResetConfirm, setShowFactoryResetConfirm] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Link Editor State (Add or Edit)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Add new social network state
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialLink['platform']>('whatsapp');
  const [newSocialLabel, setNewSocialLabel] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Success toast helper
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // PWA Icon generator state
  const [isGeneratingIcons, setIsGeneratingIcons] = useState(false);
  const [pwaProgressStep, setPwaProgressStep] = useState<string | null>(null);
  const [pwaUploadFile, setPwaUploadFile] = useState<File | null>(null);
  const [pwaUploadPreview, setPwaUploadPreview] = useState<string | null>(null);

  const handleDownloadPwaIcons = async () => {
    try {
      setIsGeneratingIcons(true);
      const source = pwaUploadFile || profile.pwaIconUrl || profile.avatarUrl;
      await downloadPwaIconSet(source, (filename) => {
        setPwaProgressStep(`Generando y descargando ${filename}...`);
      });
      showNotification('¡Los 3 iconos PWA se han descargado con éxito!');
      setPwaProgressStep(null);
    } catch (err) {
      console.error(err);
      showNotification('Error al procesar la imagen para los iconos.');
      setPwaProgressStep(null);
    } finally {
      setIsGeneratingIcons(false);
    }
  };

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (storageService.verifyPassword(passwordInput)) {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Contraseña incorrecta. (Clave por defecto: admin123)');
    }
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!storageService.verifyPassword(currentPassword)) {
      setPasswordError('La contraseña actual no es correcta.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    storageService.savePassword(newPassword);
    setPasswordSuccess('¡Contraseña actualizada con éxito! Se utilizará para tus próximos accesos.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Link Actions
  const handleSaveLink = (linkToSave: LinkItem) => {
    let updated: LinkItem[];
    if (isAddingLink) {
      updated = [linkToSave, ...links];
    } else {
      updated = links.map((l) => (l.id === linkToSave.id ? linkToSave : l));
    }
    onUpdateLinks(updated);
    storageService.saveLinks(updated);
    setIsAddingLink(false);
    setEditingLink(null);
    showNotification(isAddingLink ? 'Enlace añadido con éxito' : 'Enlace actualizado');
  };

  const handleConfirmDeleteLink = (id: string) => {
    const updated = links.filter((l) => l.id !== id);
    onUpdateLinks(updated);
    storageService.saveLinks(updated);
    setDeletingLinkId(null);
    showNotification('Enlace eliminado con éxito');
  };

  const handleToggleLinkActive = (id: string) => {
    const updated = links.map((l) => (l.id === id ? { ...l, active: !l.active } : l));
    onUpdateLinks(updated);
    storageService.saveLinks(updated);
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    onUpdateLinks(newLinks);
    storageService.saveLinks(newLinks);
  };

  // Theme Preset Change
  const handleSelectThemePreset = (presetId: ThemePresetId) => {
    const preset = THEME_PRESETS[presetId];
    if (preset) {
      onUpdateTheme(preset);
      storageService.saveTheme(preset);
      showNotification(`Tema "${presetId}" aplicado`);
    }
  };

  // Reset Analytics EXECUTION (Instant and 100% reliable)
  const executeResetAnalytics = () => {
    const { freshAnalytics, resetLinks } = storageService.resetAnalytics();
    onUpdateAnalytics(freshAnalytics);
    onUpdateLinks(resetLinks);
    setShowResetConfirm(false);
    showNotification('¡Todas las métricas y clics se han reiniciado a 0!');
  };

  // Export & Import
  const handleExportBackup = () => {
    const json = storageService.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elamortraspasa-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Copia de seguridad descargada');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storageService.importBackup(content)) {
        onUpdateLinks(storageService.getLinks());
        onUpdateProfile(storageService.getProfile());
        onUpdateTheme(storageService.getTheme());
        onUpdateAnalytics(storageService.getAnalytics());
        showNotification('Configuración restaurada con éxito');
      } else {
        showNotification('Error: archivo JSON inválido');
      }
    };
    reader.readAsText(file);
  };

  // Factory Reset Execution
  const executeFactoryReset = () => {
    const resetData = storageService.resetAllToDefault();
    onUpdateLinks(resetData.links);
    onUpdateProfile(resetData.profile);
    onUpdateTheme(resetData.theme);
    onUpdateAnalytics(resetData.analytics);
    setShowFactoryResetConfirm(false);
    showNotification('Restablecido al diseño original de El Amor Traspasa');
  };

  // Update Custom Text helper
  const handleUpdateCustomText = (key: keyof CustomTextsConfig, value: string) => {
    const currentTexts = profile.customTexts || {};
    const updatedTexts = { ...currentTexts, [key]: value };
    const updatedProfile = { ...profile, customTexts: updatedTexts };
    onUpdateProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
  };

  // Auto-detect YouTube thumbnail
  const handleAutoThumbnailFromYouTube = () => {
    const currentVideoUrl = profile.featuredMedia?.videoUrl || '';
    const youtubeId = extractYouTubeId(currentVideoUrl);
    if (!youtubeId) {
      showNotification('No se detectó un enlace válido de YouTube. Introduce un enlace de YouTube primero.');
      return;
    }
    const thumb = getYouTubeThumbnail(currentVideoUrl);
    const updatedMedia = {
      ...(profile.featuredMedia || {
        enabled: true,
        title: 'Video Destacado',
        subtitle: 'Míralo ahora',
        tag: 'DESTACADO',
        videoUrl: currentVideoUrl,
        thumbnailUrl: thumb,
      }),
      thumbnailUrl: thumb,
    };
    const updatedProfile = { ...profile, featuredMedia: updatedMedia };
    onUpdateProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
    showNotification('¡Miniatura de YouTube obtenida automáticamente!');
  };

  // Add new social link
  const handleAddSocial = () => {
    if (!newSocialUrl.trim()) {
      showNotification('Por favor introduce el enlace o dato de la red social');
      return;
    }
    const formattedUrl = formatSocialUrl(newSocialPlatform, newSocialUrl);
    const newSocial: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: newSocialPlatform,
      label: newSocialLabel.trim() || newSocialPlatform.toUpperCase(),
      url: formattedUrl,
      active: true,
    };
    const updatedSocials = [...profile.socialLinks, newSocial];
    const updatedProfile = { ...profile, socialLinks: updatedSocials };
    onUpdateProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
    setIsAddingSocial(false);
    setNewSocialLabel('');
    setNewSocialUrl('');
    showNotification('Nueva red social añadida con éxito');
  };

  // Delete social link
  const handleDeleteSocial = (id: string) => {
    const updatedSocials = profile.socialLinks.filter((s) => s.id !== id);
    const updatedProfile = { ...profile, socialLinks: updatedSocials };
    onUpdateProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
    showNotification('Red social eliminada');
  };

  // Render Login Gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-md p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Panel de Administración</h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Ingresa tu contraseña para editar video destacado, enlaces, redes reales y analíticas.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña de Acceso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Introduce tu clave..."
                  className="w-full px-4 py-3 text-sm rounded-xl bg-slate-950 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors pr-11"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Entrar al Panel</span>
            </button>
          </form>

          {/* Quick Demo Hint */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              💡 Clave inicial por defecto:{' '}
              <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                admin123
              </span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Podrás cambiarla inmediatamente desde la pestaña &quot;Seguridad&quot; adentro del panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate CTR
  const ctr =
    analytics.totalVisits > 0
      ? ((analytics.totalClicks / analytics.totalVisits) * 100).toFixed(1)
      : '0.0';

  const mostClickedLink = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-200">
        {/* Toast notification */}
        {statusNotification && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-amber-500 text-slate-950 shadow-xl animate-bounce">
            <Check className="w-4 h-4" />
            <span>{statusNotification}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Administrador El Amor Traspasa</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  En Vivo
                </span>
              </h2>
              <p className="text-xs text-slate-400">Personaliza enlaces, video destacado, redes reales y analíticas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors border border-slate-700 cursor-pointer"
              title="Cerrar Sesión del Administrador"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Bloquear</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'video'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Destacado</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'social'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Redes Sociales ({profile.socialLinks.filter((s) => s.active).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'links'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Enlaces ({links.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analíticas en Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab('texts')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'texts'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Personalizar Textos</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Temas y Colores</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Seguridad & Clave</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Respaldo</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ================= TAB: VIDEO DESTACADO ================= */}
          {activeTab === 'video' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Tarjeta de Video / Mensaje Destacado</h3>
                    <p className="text-xs text-slate-400">
                      Configura el enlace del video (YouTube, Live o enlace externo), su miniatura y modo de reproducción.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...profile,
                      featuredMedia: {
                        ...(profile.featuredMedia || {
                          enabled: false,
                          title: 'Último Mensaje: El Amor Nunca Se Rinde',
                          subtitle: 'Míralo ahora en YouTube • Domingos en Vivo',
                          tag: 'DESTACADO',
                          videoUrl: 'https://www.youtube.com',
                          thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
                          embedMode: 'popup',
                        }),
                        enabled: !profile.featuredMedia?.enabled,
                      },
                    };
                    onUpdateProfile(updated);
                    storageService.saveProfile(updated);
                    showNotification(
                      updated.featuredMedia.enabled
                        ? 'Tarjeta de video activada'
                        : 'Tarjeta de video ocultada'
                    );
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    profile.featuredMedia?.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {profile.featuredMedia?.enabled ? '✓ Visible en la web' : 'Oculto'}
                </button>
              </div>

              {profile.featuredMedia?.enabled && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                  {/* Video URL Input with YouTube Auto-detection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-amber-400" />
                        <span>Enlace del Video (YouTube o URL) *</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoThumbnailFromYouTube}
                        className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/20 cursor-pointer"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Obtener Miniatura de YouTube</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={profile.featuredMedia.videoUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = {
                            ...profile,
                            featuredMedia: {
                              ...profile.featuredMedia!,
                              videoUrl: val,
                            },
                          };
                          onUpdateProfile(updated);
                          storageService.saveProfile(updated);
                        }}
                        placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                        className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />

                      <a
                        href={profile.featuredMedia.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 flex items-center gap-1.5 shrink-0"
                        title="Probar enlace en pestaña nueva"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Probar Video</span>
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Pega cualquier enlace de video de YouTube (ej: https://www.youtube.com/watch?v=...) o video en vivo.
                    </p>
                  </div>

                  {/* Mode of reproduction */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Modo de Reproducción al Hacer Clic
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...profile,
                            featuredMedia: {
                              ...profile.featuredMedia!,
                              embedMode: 'popup' as const,
                            },
                          };
                          onUpdateProfile(updated);
                          storageService.saveProfile(updated);
                        }}
                        className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                          profile.featuredMedia.embedMode !== 'newTab'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-xs text-white">Reproductor Emergente (Dentro de la web)</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Abre un reproductor de YouTube interactivo sin que el usuario salga de tu página.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...profile,
                            featuredMedia: {
                              ...profile.featuredMedia!,
                              embedMode: 'newTab' as const,
                            },
                          };
                          onUpdateProfile(updated);
                          storageService.saveProfile(updated);
                        }}
                        className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                          profile.featuredMedia.embedMode === 'newTab'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-xs text-white">Abrir en YouTube Directamente</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Redirige o abre la app oficial de YouTube en una pestaña nueva.
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Título de la Tarjeta *
                      </label>
                      <input
                        type="text"
                        value={profile.featuredMedia.title}
                        onChange={(e) => {
                          const updated = {
                            ...profile,
                            featuredMedia: {
                              ...profile.featuredMedia!,
                              title: e.target.value,
                            },
                          };
                          onUpdateProfile(updated);
                          storageService.saveProfile(updated);
                        }}
                        placeholder="Ej: Transmisión en Vivo Domingos"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Subtítulo descriptivo
                      </label>
                      <input
                        type="text"
                        value={profile.featuredMedia.subtitle}
                        onChange={(e) => {
                          const updated = {
                            ...profile,
                            featuredMedia: {
                              ...profile.featuredMedia!,
                              subtitle: e.target.value,
                            },
                          };
                          onUpdateProfile(updated);
                          storageService.saveProfile(updated);
                        }}
                        placeholder="Ej: 11:00 AM • Mensaje dominical"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Etiqueta / Badge (ej: EN VIVO, NUEVO, DESTACADO)
                      </label>
                      <input
                        type="text"
                        value={profile.featuredMedia.tag}
                        onChange={(e) => {
                          const updated = {
                            ...profile,
                            featuredMedia: {
                              ...profile.featuredMedia!,
                              tag: e.target.value,
                            },
                          };
                          onUpdateProfile(updated);
                          storageService.saveProfile(updated);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        URL de la Imagen de Fondo / Miniatura
                      </label>
                      <input
                        type="url"
                        value={profile.featuredMedia.thumbnailUrl}
                        onChange={(e) => {
                          const updated = {
                            ...profile,
                            featuredMedia: {
                              ...profile.featuredMedia!,
                              thumbnailUrl: e.target.value,
                            },
                          };
                          onUpdateProfile(updated);
                          storageService.saveProfile(updated);
                        }}
                        placeholder="https://images.unsplash.com/... o https://img.youtube.com/..."
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Live Preview Box */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">
                      Vista previa de cómo se ve la tarjeta actualmente:
                    </label>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-w-md bg-slate-900">
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={profile.featuredMedia.thumbnailUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        {profile.featuredMedia.tag && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                            {profile.featuredMedia.tag}
                          </span>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950">
                        <div className="font-bold text-sm text-white truncate">
                          {profile.featuredMedia.title || 'Título del Video'}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {profile.featuredMedia.subtitle || 'Subtítulo del Video'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB: REDES SOCIALES REALES ================= */}
          {activeTab === 'social' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Botones de Redes Sociales Oficiales</h3>
                    <p className="text-xs text-slate-400">
                      Personaliza con tus datos reales (número de WhatsApp, @instagram, canal de YouTube, correo pastoral, etc.).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingSocial(true)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Otra Red</span>
                </button>
              </div>

              {/* Add New Social Form */}
              {isAddingSocial && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-amber-400">Añadir Nueva Red Social</h4>
                    <button
                      onClick={() => setIsAddingSocial(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Plataforma
                      </label>
                      <select
                        value={newSocialPlatform}
                        onChange={(e) =>
                          setNewSocialPlatform(e.target.value as SocialLink['platform'])
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                        <option value="facebook">Facebook</option>
                        <option value="spotify">Spotify</option>
                        <option value="tiktok">TikTok</option>
                        <option value="email">Correo Electrónico</option>
                        <option value="phone">Teléfono / Llamada</option>
                        <option value="globe">Sitio Web / Enlace</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nombre / Etiqueta
                      </label>
                      <input
                        type="text"
                        value={newSocialLabel}
                        onChange={(e) => setNewSocialLabel(e.target.value)}
                        placeholder="Ej: WhatsApp Pastoral"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Enlace o Dato Real
                      </label>
                      <input
                        type="text"
                        value={newSocialUrl}
                        onChange={(e) => setNewSocialUrl(e.target.value)}
                        placeholder="Ej: +34 600 000 000 o @usuario"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsAddingSocial(false)}
                      className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg bg-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddSocial}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
                    >
                      Guardar Red
                    </button>
                  </div>
                </div>
              )}

              {/* Social Links List */}
              <div className="space-y-3">
                {profile.socialLinks.map((soc, idx) => (
                  <div
                    key={soc.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                          <IconRenderer name={soc.platform} className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm text-white uppercase">{soc.platform}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Open real link to test */}
                        {soc.url && (
                          <a
                            href={soc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center gap-1"
                            title="Probar en pestaña nueva"
                          >
                            <ExternalLink className="w-3 h-3 text-amber-400" />
                            <span className="hidden sm:inline">Probar Enlace</span>
                          </a>
                        )}

                        {/* Active toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...profile.socialLinks];
                            updated[idx] = { ...updated[idx], active: !updated[idx].active };
                            const updatedProfile = { ...profile, socialLinks: updated };
                            onUpdateProfile(updatedProfile);
                            storageService.saveProfile(updatedProfile);
                          }}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
                            soc.active
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                        >
                          {soc.active ? 'Visible en cabecera' : 'Oculto'}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSocial(soc.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                          title="Eliminar red social"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Etiqueta / Nombre
                        </label>
                        <input
                          type="text"
                          value={soc.label}
                          onChange={(e) => {
                            const updated = [...profile.socialLinks];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            const updatedProfile = { ...profile, socialLinks: updated };
                            onUpdateProfile(updatedProfile);
                            storageService.saveProfile(updatedProfile);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-slate-400">
                            Enlace Real (URL)
                          </label>
                          {/* Intelligent Assistant helper buttons */}
                          {soc.platform === 'whatsapp' && (
                            <button
                              type="button"
                              onClick={() => {
                                const formatted = formatSocialUrl('whatsapp', soc.url);
                                const updated = [...profile.socialLinks];
                                updated[idx] = { ...updated[idx], url: formatted };
                                const updatedProfile = { ...profile, socialLinks: updated };
                                onUpdateProfile(updatedProfile);
                                storageService.saveProfile(updatedProfile);
                                showNotification('Enlace de WhatsApp generado correctamente');
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                            >
                              ⚡ Asistente WhatsApp (Número a wa.me)
                            </button>
                          )}
                          {soc.platform === 'instagram' && (
                            <button
                              type="button"
                              onClick={() => {
                                const formatted = formatSocialUrl('instagram', soc.url);
                                const updated = [...profile.socialLinks];
                                updated[idx] = { ...updated[idx], url: formatted };
                                const updatedProfile = { ...profile, socialLinks: updated };
                                onUpdateProfile(updatedProfile);
                                storageService.saveProfile(updatedProfile);
                                showNotification('Enlace de Instagram generado');
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                            >
                              ⚡ Asistente Instagram (@usuario a link)
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={soc.url}
                          onChange={(e) => {
                            const updated = [...profile.socialLinks];
                            updated[idx] = { ...updated[idx], url: e.target.value };
                            const updatedProfile = { ...profile, socialLinks: updated };
                            onUpdateProfile(updatedProfile);
                            storageService.saveProfile(updatedProfile);
                          }}
                          placeholder={
                            soc.platform === 'whatsapp'
                              ? 'https://wa.me/34600000000 o +34 600 000 000'
                              : soc.platform === 'instagram'
                              ? 'https://instagram.com/tu_cuenta o @tu_cuenta'
                              : 'https://...'
                          }
                          className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: ANALYTICS ================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              {/* In-app Reset Confirmation Banner */}
              {showResetConfirm && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xl">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">¿Confirmar reinicio de analíticas?</h4>
                      <p className="text-xs text-rose-200/80">
                        Esta acción pondrá en 0 el contador total de visitas, clics y los clics de cada uno de tus enlaces.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={executeResetAnalytics}
                      className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Sí, reiniciar todo a 0</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-medium">Total Visitas</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {analytics.totalVisits.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">visitas</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-medium">Total Clics</span>
                    <MousePointerClick className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {analytics.totalClicks.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold">en vivo</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-medium">Tasa de Clics (CTR)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">{ctr}%</span>
                    <span className="text-[10px] text-slate-400">conversión</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-medium">Enlace Más Popular</span>
                    <Sparkles className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {mostClickedLink?.title || 'Ninguno'}
                    </span>
                    <span className="text-[11px] font-mono text-amber-400">
                      {mostClickedLink?.clicks || 0} clics
                    </span>
                  </div>
                </div>
              </div>

              {/* Action bar for testing / simulation & functional RESET */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-white">
                    Monitor en Vivo de Clics
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      if (links.length > 0) {
                        const randomLink = links[Math.floor(Math.random() * links.length)];
                        onSimulateClick(randomLink.id);
                        showNotification(`¡Clic simulado en "${randomLink.title}"!`);
                      }
                    }}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span>Probar Clic en Vivo</span>
                  </button>

                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-3.5 py-2 text-xs font-bold text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-600 rounded-xl transition-all border border-rose-500/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Reiniciar todas las métricas de clics"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar Métricas a 0</span>
                  </button>
                </div>
              </div>

              {/* Performance by Link Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                  <span>Rendimiento por Enlace (Clics y Porcentaje)</span>
                  <span className="text-xs font-normal text-slate-400">Total: {analytics.totalClicks} clics</span>
                </h4>

                <div className="space-y-3">
                  {[...links]
                    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                    .map((item) => {
                      const sharePercent =
                        analytics.totalClicks > 0
                          ? Math.round(((item.clicks || 0) / analytics.totalClicks) * 100)
                          : 0;

                      return (
                        <div key={item.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate pr-2">
                              <IconRenderer name={item.icon} className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="font-semibold text-slate-200 truncate">{item.title}</span>
                              {!item.active && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                  Pausado
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 font-mono">
                              <span className="text-slate-400">{sharePercent}%</span>
                              <span className="font-bold text-amber-400">{item.clicks || 0} clics</span>
                            </div>
                          </div>

                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                              style={{ width: `${Math.max(sharePercent, analytics.totalClicks > 0 ? 2 : 0)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Sources & Devices Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Referrers */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-3">Fuentes de Tráfico (Referidos)</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.referrerCounts || {}).map(([ref, count]) => (
                      <div key={ref} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                        <span className="text-slate-300">{ref}</span>
                        <span className="font-mono font-semibold text-slate-100">{count} visitas</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Devices */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-3">Dispositivos</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-300">
                        <Smartphone className="w-4 h-4 text-amber-400" /> Móvil
                      </span>
                      <span className="font-mono font-semibold text-white">
                        {analytics.deviceCounts?.mobile || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-300">
                        <Monitor className="w-4 h-4 text-blue-400" /> Computadora de Escritorio
                      </span>
                      <span className="font-mono font-semibold text-white">
                        {analytics.deviceCounts?.desktop || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-300">
                        <Tablet className="w-4 h-4 text-purple-400" /> Tablet
                      </span>
                      <span className="font-mono font-semibold text-white">
                        {analytics.deviceCounts?.tablet || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events Live Feed */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                  <span>Registro de Clics Recientes</span>
                  <span className="text-[11px] text-slate-400 font-mono">Últimos eventos</span>
                </h4>
                {analytics.recentEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No hay clics registrados aún (o han sido reiniciados a 0).</p>
                ) : (
                  <div className="divide-y divide-slate-900 max-h-56 overflow-y-auto">
                    {analytics.recentEvents.map((ev) => (
                      <div key={ev.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className="font-semibold text-slate-200 truncate">{ev.linkTitle}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-slate-400 font-mono text-[11px]">
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {ev.referrer}
                          </span>
                          <span>{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB: LINKS MANAGEMENT ================= */}
          {activeTab === 'links' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Lista de Enlaces</h3>
                  <p className="text-xs text-slate-400">
                    Ordena, edita o elimina enlaces. Todo se refleja al instante.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingLink({
                      id: `link-${Date.now()}`,
                      title: '',
                      subtitle: '',
                      url: 'https://',
                      icon: 'whatsapp',
                      animation: 'none',
                      active: true,
                      clicks: 0,
                    });
                    setIsAddingLink(true);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Nuevo Enlace</span>
                </button>
              </div>

              {/* Links List */}
              <div className="space-y-2.5">
                {links.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      item.active
                        ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    {/* Left Icon & Info */}
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                        <IconRenderer name={item.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate">{item.title}</span>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {item.badge.text}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{item.url}</p>
                      </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      {/* Clicks badge */}
                      <span className="hidden md:inline-block px-2.5 py-1 text-[11px] font-mono rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                        {item.clicks || 0} clics
                      </span>

                      {/* Reorder Up/Down */}
                      <button
                        onClick={() => handleMoveLink(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-800 cursor-pointer"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveLink(index, 'down')}
                        disabled={index === links.length - 1}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-800 cursor-pointer"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Active toggle */}
                      <button
                        onClick={() => handleToggleLinkActive(item.id)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors border cursor-pointer ${
                          item.active
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                        title={item.active ? 'Desactivar' : 'Activar'}
                      >
                        {item.active ? 'Visible' : 'Oculto'}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingLink({ ...item });
                          setIsAddingLink(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-amber-400 hover:text-amber-300 transition-colors border border-slate-800 cursor-pointer"
                        title="Editar enlace"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button with In-app inline confirmation */}
                      {deletingLinkId === item.id ? (
                        <div className="flex items-center gap-1 bg-rose-950/80 p-1 rounded-lg border border-rose-700 animate-fade-in">
                          <span className="text-[10px] text-rose-200 px-1">¿Eliminar?</span>
                          <button
                            onClick={() => handleConfirmDeleteLink(item.id)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setDeletingLinkId(null)}
                            className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingLinkId(item.id)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors border border-slate-800 cursor-pointer"
                          title="Eliminar enlace"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Link Edit / Add Form */}
              {editingLink && (
                <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      <span>{isAddingLink ? 'Añadir Nuevo Enlace' : 'Editar Enlace'}</span>
                    </h4>
                    <button
                      onClick={() => setEditingLink(null)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Título del Botón *
                      </label>
                      <input
                        type="text"
                        value={editingLink.title}
                        onChange={(e) =>
                          setEditingLink({ ...editingLink, title: e.target.value })
                        }
                        placeholder="Ej: Grupo Oficial en WhatsApp"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Subtítulo o Descripción corta
                      </label>
                      <input
                        type="text"
                        value={editingLink.subtitle || ''}
                        onChange={(e) =>
                          setEditingLink({ ...editingLink, subtitle: e.target.value })
                        }
                        placeholder="Ej: Reflexiones diarias y oración"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        URL de Destino *
                      </label>
                      <input
                        type="url"
                        value={editingLink.url}
                        onChange={(e) =>
                          setEditingLink({ ...editingLink, url: e.target.value })
                        }
                        placeholder="https://chat.whatsapp.com/... o https://youtube.com/..."
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Icono
                      </label>
                      <select
                        value={editingLink.icon}
                        onChange={(e) =>
                          setEditingLink({ ...editingLink, icon: e.target.value as IconName })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      >
                        {AVAILABLE_ICONS.map((ic) => (
                          <option key={ic.name} value={ic.name}>
                            {ic.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Categoría
                      </label>
                      <select
                        value={editingLink.category || 'general'}
                        onChange={(e) =>
                          setEditingLink({ ...editingLink, category: e.target.value as any })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="general">General</option>
                        <option value="community">Comunidad</option>
                        <option value="multimedia">Transmisiones / Video</option>
                        <option value="donations">Donaciones / Siembra</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Efecto de Animación
                      </label>
                      <select
                        value={editingLink.animation}
                        onChange={(e) =>
                          setEditingLink({
                            ...editingLink,
                            animation: e.target.value as ButtonAnimation,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="none">Sin animación</option>
                        <option value="pulse">Pulso suave</option>
                        <option value="glow">Resplandor luminoso</option>
                        <option value="bounce">Rebote llamativo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Texto de Etiqueta (Badge opcional)
                      </label>
                      <input
                        type="text"
                        value={editingLink.badge?.text || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingLink({
                            ...editingLink,
                            badge: val
                              ? {
                                  text: val,
                                  color: editingLink.badge?.color || 'amber',
                                }
                              : undefined,
                          });
                        }}
                        placeholder="Ej: EN VIVO, NUEVO, DESTACADO"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Color de Etiqueta
                      </label>
                      <select
                        value={editingLink.badge?.color || 'amber'}
                        onChange={(e) => {
                          if (editingLink.badge) {
                            setEditingLink({
                              ...editingLink,
                              badge: {
                                ...editingLink.badge,
                                color: e.target.value as any,
                              },
                            });
                          }
                        }}
                        disabled={!editingLink.badge}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-40 focus:outline-none focus:border-amber-500"
                      >
                        <option value="amber">Ámbar / Oro</option>
                        <option value="emerald">Verde Esmeralda</option>
                        <option value="red">Rojo Vivo</option>
                        <option value="rose">Rosa Cálido</option>
                        <option value="blue">Azul Océano</option>
                        <option value="purple">Púrpura</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingLink(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editingLink.title.trim()) {
                          showNotification('Por favor ingresa un título para el enlace');
                          return;
                        }
                        handleSaveLink(editingLink);
                      }}
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md cursor-pointer"
                    >
                      Guardar Enlace
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB: PERSONALIZAR TODOS LOS TEXTOS ================= */}
          {activeTab === 'texts' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                ✏️ <strong>Personalización total de textos:</strong> Aquí puedes modificar cualquier texto de la web en tiempo real: títulos, eslogan, nombres de botones, pestañas de categorías y pie de página.
              </div>

              {/* 1. Header & Identity Texts */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Type className="w-4 h-4 text-amber-400" />
                  <span>Textos de Cabecera y Perfil</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nombre Principal / Título
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => {
                        const updated = { ...profile, name: e.target.value };
                        onUpdateProfile(updated);
                        storageService.saveProfile(updated);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Subtítulo o Usuario (@handle)
                    </label>
                    <input
                      type="text"
                      value={profile.handle}
                      onChange={(e) => {
                        const updated = { ...profile, handle: e.target.value };
                        onUpdateProfile(updated);
                        storageService.saveProfile(updated);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Biografía / Eslogan Principal
                    </label>
                    <textarea
                      rows={2}
                      value={profile.bio}
                      onChange={(e) => {
                        const updated = { ...profile, bio: e.target.value };
                        onUpdateProfile(updated);
                        storageService.saveProfile(updated);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Texto de Ubicación / Etiqueta
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => {
                        const updated = { ...profile, location: e.target.value };
                        onUpdateProfile(updated);
                        storageService.saveProfile(updated);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tooltip de Verificación
                    </label>
                    <input
                      type="text"
                      value={profile.customTexts?.verifiedBadgeText || 'Cuenta Oficial Verificada'}
                      onChange={(e) => handleUpdateCustomText('verifiedBadgeText', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Category Filter Tabs Texts */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-amber-400" />
                  <span>Nombres de Pestañas y Filtros</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Filtro 1
                    </label>
                    <input
                      type="text"
                      value={profile.customTexts?.categoryAll ?? 'Todos'}
                      onChange={(e) => handleUpdateCustomText('categoryAll', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Filtro 2
                    </label>
                    <input
                      type="text"
                      value={profile.customTexts?.categoryCommunity ?? 'Comunidad'}
                      onChange={(e) => handleUpdateCustomText('categoryCommunity', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Filtro 3
                    </label>
                    <input
                      type="text"
                      value={profile.customTexts?.categoryMultimedia ?? 'Transmisiones'}
                      onChange={(e) => handleUpdateCustomText('categoryMultimedia', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Filtro 4
                    </label>
                    <input
                      type="text"
                      value={profile.customTexts?.categoryDonations ?? 'Donaciones'}
                      onChange={(e) => handleUpdateCustomText('categoryDonations', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mensaje cuando una categoría está vacía
                  </label>
                  <input
                    type="text"
                    value={profile.customTexts?.emptyStateText ?? 'No hay enlaces en esta categoría.'}
                    onChange={(e) => handleUpdateCustomText('emptyStateText', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 3. Action Buttons & Footer Texts */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Botones de Acción y Pie de Página</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Botón de Configurar (Barra Superior)
                    </label>
                    <input
                      type="text"
                      value={profile.customTexts?.topBarButtonText ?? 'Configurar'}
                      onChange={(e) => handleUpdateCustomText('topBarButtonText', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Etiqueta Clics en Vivo
                    </label>
                    <input
                      type="text"
                      value={profile.customTexts?.topBarLiveBadge ?? 'clics en vivo'}
                      onChange={(e) => handleUpdateCustomText('topBarLiveBadge', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Botón de Código QR & Compartir
                    </label>
                    <input
                      type="text"
                      value={profile.customTexts?.shareModalButtonText ?? 'Ver Código QR & Compartir'}
                      onChange={(e) => handleUpdateCustomText('shareModalButtonText', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Texto del Pie de Página (Copyright / Créditos)
                  </label>
                  <input
                    type="text"
                    value={profile.footerText}
                    onChange={(e) => {
                      const updated = { ...profile, footerText: e.target.value };
                      onUpdateProfile(updated);
                      storageService.saveProfile(updated);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Company Branding Settings */}
                <div className="pt-4 border-t border-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Logotipo y Enlace de Empresa en el Pie (Branding)</span>
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Muestra el logo clickeable de tu agencia o empresa desarrolladora.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const current = profile.companyBranding || {
                          enabled: true,
                          name: 'LA VISUAL MARKETING',
                          logoUrl: 'la-visual-marketing.png',
                          websiteUrl: 'https://lavisualmk.alastecno.com',
                          label: 'Desarrollado & Diseñado por',
                        };
                        const updated = {
                          ...profile,
                          companyBranding: {
                            ...current,
                            enabled: !current.enabled,
                          },
                        };
                        onUpdateProfile(updated);
                        storageService.saveProfile(updated);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                        profile.companyBranding?.enabled !== false
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {profile.companyBranding?.enabled !== false ? 'Visible' : 'Oculto'}
                    </button>
                  </div>

                  {profile.companyBranding?.enabled !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Nombre de la Empresa
                        </label>
                        <input
                          type="text"
                          value={profile.companyBranding?.name ?? 'LA VISUAL MARKETING'}
                          onChange={(e) => {
                            const updated = {
                              ...profile,
                              companyBranding: {
                                ...(profile.companyBranding || {
                                  enabled: true,
                                  logoUrl: 'la-visual-marketing.png',
                                  websiteUrl: 'https://lavisualmk.alastecno.com',
                                  label: 'Desarrollado & Diseñado por',
                                }),
                                name: e.target.value,
                              },
                            };
                            onUpdateProfile(updated);
                            storageService.saveProfile(updated);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Enlace Web de la Empresa
                        </label>
                        <input
                          type="url"
                          value={profile.companyBranding?.websiteUrl ?? 'https://lavisualmk.alastecno.com'}
                          onChange={(e) => {
                            const updated = {
                              ...profile,
                              companyBranding: {
                                ...(profile.companyBranding || {
                                  enabled: true,
                                  name: 'LA VISUAL MARKETING',
                                  logoUrl: 'la-visual-marketing.png',
                                  label: 'Desarrollado & Diseñado por',
                                }),
                                websiteUrl: e.target.value,
                              },
                            };
                            onUpdateProfile(updated);
                            storageService.saveProfile(updated);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Etiqueta Superior
                        </label>
                        <input
                          type="text"
                          value={profile.companyBranding?.label ?? 'Desarrollado & Diseñado por'}
                          onChange={(e) => {
                            const updated = {
                              ...profile,
                              companyBranding: {
                                ...(profile.companyBranding || {
                                  enabled: true,
                                  name: 'LA VISUAL MARKETING',
                                  logoUrl: 'la-visual-marketing.png',
                                  websiteUrl: 'https://lavisualmk.alastecno.com',
                                }),
                                label: e.target.value,
                              },
                            };
                            onUpdateProfile(updated);
                            storageService.saveProfile(updated);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Ruta o URL del Logo
                        </label>
                        <input
                          type="text"
                          value={profile.companyBranding?.logoUrl ?? 'la-visual-marketing.png'}
                          onChange={(e) => {
                            const updated = {
                              ...profile,
                              companyBranding: {
                                ...(profile.companyBranding || {
                                  enabled: true,
                                  name: 'LA VISUAL MARKETING',
                                  websiteUrl: 'https://lavisualmk.alastecno.com',
                                  label: 'Desarrollado & Diseñado por',
                                }),
                                logoUrl: e.target.value,
                              },
                            };
                            onUpdateProfile(updated);
                            storageService.saveProfile(updated);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: APARIENCIA ================= */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              {/* Theme Presets */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">Temas Visuales Predefinidos</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Elige un estilo para transformar instantáneamente colores, degradados y tarjetas.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'elamor',
                      name: 'El Amor Traspasa',
                      desc: 'Ámbar, Rosa y Atardecer',
                      gradient: 'from-amber-600 via-rose-700 to-slate-900',
                    },
                    {
                      id: 'celestial',
                      name: 'Aurora Celestial',
                      desc: 'Índigo y Violeta Neón',
                      gradient: 'from-indigo-600 via-purple-700 to-slate-950',
                    },
                    {
                      id: 'oasis',
                      name: 'Oasis Esmeralda',
                      desc: 'Verde Esmeralda y Menta',
                      gradient: 'from-emerald-600 via-teal-800 to-slate-950',
                    },
                    {
                      id: 'midnight',
                      name: 'Midnight Lujo',
                      desc: 'Obsidiana y Oro Champán',
                      gradient: 'from-neutral-800 via-neutral-900 to-black',
                    },
                    {
                      id: 'sunset',
                      name: 'Atardecer Radiante',
                      desc: 'Naranja Cálido y Fuego',
                      gradient: 'from-orange-600 via-rose-600 to-purple-900',
                    },
                    {
                      id: 'minimal',
                      name: 'Minimalista Claro',
                      desc: 'Fondo Claro y Sombra Suave',
                      gradient: 'from-slate-100 to-slate-300',
                    },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectThemePreset(preset.id as ThemePresetId)}
                      className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        theme.presetId === preset.id
                          ? 'border-amber-400 ring-2 ring-amber-400/30 bg-slate-900'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-full h-12 rounded-xl mb-2.5 bg-gradient-to-r ${preset.gradient} border border-white/10`}
                      />
                      <div className="font-bold text-xs text-white">{preset.name}</div>
                      <div className="text-[10px] text-slate-400">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar & Photo Settings */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white mb-2">Foto de Perfil & Avatar</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      URL del Avatar / Foto de Perfil
                    </label>
                    <input
                      type="url"
                      value={profile.avatarUrl}
                      onChange={(e) => {
                        const updated = { ...profile, avatarUrl: e.target.value };
                        onUpdateProfile(updated);
                        storageService.saveProfile(updated);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono mb-2"
                    />

                    {/* Presets Avatars */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[11px] text-slate-400">Presets rápidos:</span>
                      {AVATAR_PRESETS.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const updated = { ...profile, avatarUrl: p.url };
                            onUpdateProfile(updated);
                            storageService.saveProfile(updated);
                          }}
                          className="text-[10px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Insignia de Cuenta Verificada
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...profile, verified: !profile.verified };
                        onUpdateProfile(updated);
                        storageService.saveProfile(updated);
                      }}
                      className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border flex items-center justify-between cursor-pointer ${
                        profile.verified
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>Insignia Verificada</span>
                      <span>{profile.verified ? 'Activada' : 'Desactivada'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* PWA App Icon Customization & GitHub Asset Generator */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Icono de la Aplicación Instalable (PWA)</h4>
                      <p className="text-xs text-slate-400">
                        Cómo personalizar el icono que aparece en el celular al instalar la app
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                    PWA Activa & Compatible
                  </span>
                </div>

                {/* Important Explanation Callout */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                  <div className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>¿Por qué debes reemplazar los archivos en GitHub y la web no lo hace sola?</span>
                  </div>
                  <p className="text-amber-100/90 leading-relaxed">
                    <strong>1. Seguridad de internet:</strong> Tu página web se ejecuta en el navegador de los usuarios y <em>no tiene contraseñas ni permisos para escribir archivos dentro de tu repositorio privado o público de GitHub</em>.
                  </p>
                  <p className="text-amber-100/90 leading-relaxed">
                    <strong>2. Cómo funciona el celular:</strong> Al tocar <em>"Instalar App"</em> o <em>"Agregar a pantalla de inicio"</em>, Android e iPhone descargan directamente los archivos físicos desde la carpeta <code className="bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded font-mono">public/</code> de GitHub, no de la memoria temporal del panel.
                  </p>
                  <p className="text-emerald-300 font-semibold pt-1">
                    ✨ ¡Para facilitártelo al 100%, creamos esta herramienta para que descargues los 3 iconos ya recortados y con las medidas exactas con 1 solo clic!
                  </p>
                </div>

                {/* Step 1: Choose Source Image */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-center font-bold flex items-center justify-center text-[11px]">1</span>
                    <span>Elige la imagen para el Icono de la App</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Option A: Select local file */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-slate-300 block">Subir imagen desde tu PC o Celular:</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPwaUploadFile(file);
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setPwaUploadPreview(ev.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                      />
                      {pwaUploadFile && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Archivo seleccionado: {pwaUploadFile.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Option B: Quick Presets */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-slate-300 block">O usa una imagen del proyecto:</span>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPwaUploadFile(null);
                            setPwaUploadPreview(profile.avatarUrl);
                            const updated = { ...profile, pwaIconUrl: profile.avatarUrl };
                            onUpdateProfile(updated);
                            storageService.saveProfile(updated);
                            showNotification('Usando tu foto de perfil como icono PWA');
                          }}
                          className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Usar Foto / Avatar Actual</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPwaUploadFile(null);
                            setPwaUploadPreview('la-visual-marketing.png');
                            const updated = { ...profile, pwaIconUrl: 'la-visual-marketing.png' };
                            onUpdateProfile(updated);
                            storageService.saveProfile(updated);
                            showNotification('Usando logo LA VISUAL MARKETING como icono PWA');
                          }}
                          className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Usar Logo LA VISUAL MARKETING</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* URL override */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      O pega una URL directa de la imagen:
                    </label>
                    <input
                      type="url"
                      value={profile.pwaIconUrl || 'pwa-512x512.png'}
                      onChange={(e) => {
                        const updated = { ...profile, pwaIconUrl: e.target.value };
                        onUpdateProfile(updated);
                        storageService.saveProfile(updated);
                      }}
                      placeholder="https://... o pwa-512x512.png"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Step 2: Download Ready Icons */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs font-bold text-white flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-center font-bold flex items-center justify-center text-[11px]">2</span>
                      <span>Descarga los 3 archivos PNG listos para GitHub</span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Genera automáticamente: 192×192, 512×512 y 180×180 (iPhone)
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    {/* Icon Preview */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 border border-slate-800 text-center shrink-0">
                      <span className="text-[10px] text-slate-400 mb-1.5 font-medium">Previsualización</span>
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-400/50 p-0.5 bg-slate-950">
                        <img
                          src={pwaUploadPreview || profile.pwaIconUrl || profile.avatarUrl || 'pwa-512x512.png'}
                          alt="PWA Icon Preview"
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'pwa-512x512.png';
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-300 mt-1 truncate max-w-[80px]">
                        AmorTraspasa
                      </span>
                    </div>

                    {/* Download CTA Button */}
                    <div className="flex-1 w-full space-y-2">
                      <button
                        type="button"
                        onClick={handleDownloadPwaIcons}
                        disabled={isGeneratingIcons}
                        className="w-full py-3 px-4 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingIcons ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                            <span>{pwaProgressStep || 'Generando iconos PNG...'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-slate-950" />
                            <span>📥 Descargar los 3 Iconos PNG para GitHub (1 Clic)</span>
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-slate-400 text-center sm:text-left">
                        Se descargarán automáticamente: <code className="text-amber-300">pwa-192x192.png</code>, <code className="text-amber-300">pwa-512x512.png</code> y <code className="text-amber-300">apple-touch-icon.png</code>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Upload to GitHub Instructions */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-center font-bold flex items-center justify-center text-[11px]">3</span>
                    <span>Reemplaza los 3 archivos en tu repositorio de GitHub</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-amber-400 font-bold">1.</span>
                      <span>
                        Abre tu repositorio en GitHub: <strong className="text-white">alasexpress25-netizen/LinkTree</strong> y haz clic en la carpeta <strong className="text-amber-300">public/</strong>.
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-mono text-amber-400 font-bold">2.</span>
                      <span>
                        Arriba a la derecha presiona el botón <strong className="text-white">Add file</strong> ➔ <strong className="text-white">Upload files</strong>.
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-mono text-amber-400 font-bold">3.</span>
                      <span>
                        Arrastra los 3 archivos que acabas de descargar (<code className="text-amber-300">pwa-192x192.png</code>, <code className="text-amber-300">pwa-512x512.png</code>, <code className="text-amber-300">apple-touch-icon.png</code>) para que reemplacen a los anteriores.
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-mono text-amber-400 font-bold">4.</span>
                      <span>
                        Haz clic en el botón verde <strong className="text-emerald-400">Commit changes</strong>.
                      </span>
                    </div>

                    <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>¡Listo!</strong> Tu GitHub Action compilará automáticamente en ~30 segundos y a partir de ese momento todos los teléfonos mostrarán tu logo personalizado al instalar.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Styling tweaks */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white mb-2">Personalización de Botones & Tarjetas</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Estilo de Tarjeta
                    </label>
                    <select
                      value={theme.cardStyle}
                      onChange={(e) => {
                        const updated = { ...theme, cardStyle: e.target.value as any };
                        onUpdateTheme(updated);
                        storageService.saveTheme(updated);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="glass">Vidrio Esmerilado (Glassmorphism)</option>
                      <option value="solid">Sólido Elegante</option>
                      <option value="neon">Neón Brillante</option>
                      <option value="soft-shadow">Sombra Suave</option>
                      <option value="border-only">Solo Borde</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Redondez de Botones
                    </label>
                    <select
                      value={theme.borderRadius}
                      onChange={(e) => {
                        const updated = { ...theme, borderRadius: e.target.value as any };
                        onUpdateTheme(updated);
                        storageService.saveTheme(updated);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="rounded-2xl">Redondeado Grande (2xl)</option>
                      <option value="rounded-full">Píldora Total (Full)</option>
                      <option value="rounded-xl">Medio (xl)</option>
                      <option value="rounded-lg">Sutil (lg)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Color de Acento
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.accentColor}
                        onChange={(e) => {
                          const updated = { ...theme, accentColor: e.target.value };
                          onUpdateTheme(updated);
                          storageService.saveTheme(updated);
                        }}
                        className="w-10 h-8 rounded-lg cursor-pointer bg-slate-900 border border-slate-800 p-0.5"
                      />
                      <span className="text-xs font-mono text-slate-300">{theme.accentColor}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-900">
                  <span className="text-xs text-slate-300">
                    Burbujas luminosas animadas en el fondo
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...theme,
                        showBackgroundBubbles: !theme.showBackgroundBubbles,
                      };
                      onUpdateTheme(updated);
                      storageService.saveTheme(updated);
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                      theme.showBackgroundBubbles
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    {theme.showBackgroundBubbles ? 'Activado' : 'Desactivado'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: SEGURIDAD Y CAMBIO DE CONTRASEÑA ================= */}
          {activeTab === 'security' && (
            <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Cambiar Contraseña de Administrador</h3>
                    <p className="text-xs text-slate-400">
                      Protege este panel actualizando tu clave de seguridad en cualquier momento.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contraseña Actual *
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Introduce tu clave actual..."
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres..."
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirmar Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña..."
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  {passwordError && (
                    <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg shadow-amber-500/15 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Actualizar Contraseña Ahora</span>
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Seguridad Activa
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Tu nueva contraseña se guarda de forma segura en el almacenamiento de tu navegador.
                    Asegúrate de recordarla para futuros accesos al panel de configuración.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: BACKUP & RESTORE ================= */}
          {activeTab === 'backup' && (
            <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Copia de Seguridad y Restauración</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Exporta toda la configuración (enlaces, textos, colores y analíticas) a un archivo JSON para tener un respaldo o moverlo a otro dispositivo.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleExportBackup}
                    className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-850 text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Descargar Backup (JSON)</span>
                  </button>

                  <label className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-850 text-white border border-slate-700 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Restaurar desde JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone: Factory Reset */}
              <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Restablecer Valores de Fábrica</span>
                </h4>
                <p className="text-xs text-rose-200/70 leading-relaxed">
                  Restaura todos los datos de muestra iniciales idénticos a El Amor Traspasa (enlaces, tema cálido, redes sociales y clave inicial admin123).
                </p>

                {showFactoryResetConfirm ? (
                  <div className="p-3 bg-rose-900/50 rounded-xl border border-rose-600 flex items-center justify-between gap-3 animate-fade-in">
                    <span className="text-xs font-bold text-white">¿Confirmar restauración total?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowFactoryResetConfirm(false)}
                        className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={executeFactoryReset}
                        className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg cursor-pointer"
                      >
                        Sí, restaurar todo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowFactoryResetConfirm(true)}
                    className="py-2.5 px-4 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors active:scale-95 cursor-pointer"
                  >
                    Restablecer a Valores Iniciales
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
