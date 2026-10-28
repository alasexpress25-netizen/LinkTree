/**
 * Utility to generate and download standardized PWA PNG icons from any user image.
 */

export function generatePwaIconBlob(
  imageSource: string | File,
  size: number,
  paddingPercent: number = 0.1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Background color matching dark slate theme: #0f172a
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size, size);

      // Calculate aspect-ratio fit
      const padding = size * paddingPercent;
      const targetSize = size - padding * 2;

      let drawWidth = targetSize;
      let drawHeight = targetSize;
      let offsetX = padding;
      let offsetY = padding;

      if (img.width > img.height) {
        drawHeight = (img.height / img.width) * targetSize;
        offsetY = padding + (targetSize - drawHeight) / 2;
      } else {
        drawWidth = (img.width / img.height) * targetSize;
        offsetX = padding + (targetSize - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create Blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for icon generation'));
    };

    if (imageSource instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageSource);
    } else {
      img.src = imageSource;
    }
  });
}

export async function downloadPwaIconSet(
  imageSource: string | File,
  onProgress?: (filename: string) => void
): Promise<void> {
  const icons = [
    { filename: 'pwa-192x192.png', size: 192, padding: 0.08 },
    { filename: 'pwa-512x512.png', size: 512, padding: 0.08 },
    { filename: 'apple-touch-icon.png', size: 180, padding: 0.1 },
  ];

  for (const icon of icons) {
    if (onProgress) onProgress(icon.filename);
    const blob = await generatePwaIconBlob(imageSource, icon.size, icon.padding);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = icon.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // slight delay between downloads so browser doesn't block multiple files
    await new Promise((res) => setTimeout(res, 200));
  }
}
