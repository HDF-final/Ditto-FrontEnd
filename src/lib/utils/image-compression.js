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

/**
 * data URL(base64) 을 Blob 으로 변환합니다.
 * 카메라 캡처본(dataURL)을 멀티파트 업로드용 바이너리로 바꿀 때 사용합니다.
 * 형식이 올바르지 않으면 null 을 반환합니다.
 */
export function dataUrlToBlob(dataUrl) {
  const [meta, base64] = String(dataUrl ?? "").split(",");
  if (!base64) return null;
  const mime = meta.match(/data:(.*?);/)?.[1] || "image/jpeg";
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}
