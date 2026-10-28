/**
 * Utilities for extracting YouTube IDs, thumbnails and formatting social URLs
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function getYouTubeThumbnail(url: string): string {
  const id = extractYouTubeId(url);
  if (id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';
}

export function getYouTubeEmbedUrl(url: string): string {
  const id = extractYouTubeId(url);
  if (id) {
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  }
  return url;
}

/**
 * Intelligent helper to format user inputs into real working URLs
 */
export function formatSocialUrl(platform: string, input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }

  switch (platform) {
    case 'whatsapp': {
      // Clean phone number (remove spaces, dashes, parentheses, plus)
      const digitsOnly = trimmed.replace(/[^\d]/g, '');
      return `https://wa.me/${digitsOnly}?text=Hola%20El%20Amor%20Traspasa,%20quiero%20conectar`;
    }
    case 'instagram': {
      const handle = trimmed.replace(/^@/, '');
      return `https://instagram.com/${handle}`;
    }
    case 'youtube': {
      if (trimmed.startsWith('@')) {
        return `https://youtube.com/${trimmed}`;
      }
      return `https://youtube.com/@${trimmed}`;
    }
    case 'tiktok': {
      const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
      return `https://tiktok.com/${handle}`;
    }
    case 'spotify': {
      return trimmed.startsWith('spotify:') ? trimmed : `https://open.spotify.com/search/${encodeURIComponent(trimmed)}`;
    }
    case 'facebook': {
      return `https://facebook.com/${trimmed}`;
    }
    case 'email': {
      return `mailto:${trimmed}`;
    }
    case 'phone': {
      const cleanPhone = trimmed.replace(/[^\d+]/g, '');
      return `tel:${cleanPhone}`;
    }
    default:
      return `https://${trimmed}`;
  }
}
