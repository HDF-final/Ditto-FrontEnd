"use client";

import { useEffect, useState } from "react";

/**
 * The Boni source PNG ships with a near-black background. This strips those
 * dark pixels to transparent on the client via a canvas pass so the mascot can
 * sit on light surfaces. Returns the original src until the pass completes.
 */
export function useTransparentBg(src, threshold = 30) {
  const [result, setResult] = useState(src);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] < threshold && d[i + 1] < threshold && d[i + 2] < threshold) {
          d[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setResult(canvas.toDataURL("image/png"));
    };
    img.src = src;
  }, [src, threshold]);

  return result;
}
