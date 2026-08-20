/**
 * Compress an image file to a lightweight data URL (JPEG ~50KB)
 * to avoid browser storage quota exceed errors and allow instant loading.
 */
export function compressImage(file, maxWidth = 1000, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file || !file.type?.startsWith("image/")) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof window === "undefined" || !result) {
        resolve(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(result);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
