import React from 'react';
import {
  Globe,
  Calendar,
  Heart,
  DollarSign,
  Music,
  BookOpen,
  MessageCircle,
  Video,
  Mail,
  Phone,
  Sparkles,
  Star,
  MapPin,
  Share2,
  Instagram,
  Youtube,
  Radio,
} from 'lucide-react';
import { IconName } from '../types';

interface IconRendererProps {
  name: IconName | string;
  className?: string;
}

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.27 6.27 0 0 0 1.87-4.49V8.65a8.28 8.28 0 0 0 4.79 1.5v-3.46h-.89z" />
  </svg>
);

export const SpotifyIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.208-2.35-1.435-5.308-1.76-8.791-.963-.336.077-.67-.134-.747-.47-.077-.336.134-.67.47-.747 3.808-.87 7.076-.505 9.717 1.115.294.18.387.563.208.857zm1.225-2.723c-.226.368-.71.482-1.078.256-2.69-1.653-6.79-2.132-9.97-1.166-.413.125-.85-.11-1.01-.523-.125-.413.11-.85.523-1.01 3.633-1.103 8.163-.568 11.28 1.345.367.226.481.71.255 1.078zm.106-2.836C14.692 8.95 9.375 8.775 6.297 9.71c-.496.15-1.022-.132-1.173-.628-.151-.496.133-1.022.628-1.173 3.535-1.073 9.404-.87 13.13 1.342.447.265.592.846.327 1.293-.265.447-.846.592-1.293.327z" />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'whatsapp':
      return <WhatsAppIcon className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'facebook':
      return <FacebookIcon className={className} />;
    case 'music':
      return <Music className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'globe':
      return <Globe className={className} />;
    case 'calendar':
      return <Calendar className={className} />;
    case 'dollar':
      return <DollarSign className={className} />;
    case 'book':
      return <BookOpen className={className} />;
    case 'message':
      return <MessageCircle className={className} />;
    case 'video':
      return <Video className={className} />;
    case 'mail':
      return <Mail className={className} />;
    case 'phone':
      return <Phone className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'star':
      return <Star className={className} />;
    case 'mapPin':
      return <MapPin className={className} />;
    case 'share':
      return <Share2 className={className} />;
    case 'tiktok':
      return <TikTokIcon className={className} />;
    case 'spotify':
      return <SpotifyIcon className={className} />;
    default:
      return <Globe className={className} />;
  }
};

export const AVAILABLE_ICONS: { name: IconName; label: string }[] = [
  { name: 'whatsapp', label: 'WhatsApp' },
  { name: 'video', label: 'YouTube / Video' },
  { name: 'heart', label: 'Corazón / Amor / Donar' },
  { name: 'sparkles', label: 'Destello / Oración' },
  { name: 'music', label: 'Música / Podcast' },
  { name: 'calendar', label: 'Calendario / Eventos' },
  { name: 'globe', label: 'Web / Internacional' },
  { name: 'book', label: 'Libro / Biblia / Guía' },
  { name: 'message', label: 'Mensaje / Chat' },
  { name: 'dollar', label: 'Siembra / Ofrenda' },
  { name: 'instagram', label: 'Instagram' },
  { name: 'youtube', label: 'YouTube' },
  { name: 'mail', label: 'Correo / Contacto' },
  { name: 'phone', label: 'Llamada / Teléfono' },
  { name: 'mapPin', label: 'Ubicación / Sede' },
  { name: 'star', label: 'Estrella / Favorito' },
];
