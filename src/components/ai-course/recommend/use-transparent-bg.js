"use client";

import { useEffect, useState } from "react";

const cache = new Map();

function cacheKey(src, threshold) {
  return `${src}:${threshold}`;
}

/**
 * The Boni source PNG ships with a near-black background. This strips those
 * dark pixels to transparent on the client via a canvas pass so the mascot can
 * sit on light surfaces.
 *
 * Returns null until the pass finishes so the raw black plate never flashes.
 * Processed images are cached for later mounts (prompt, overlay, chat).
 */
export function useTransparentBg(src, threshold = 30) {
  const key = cacheKey(src, threshold);
  const [result, setResult] = useState(() => cache.get(key) ?? null);
  const [renderedKey, setRenderedKey] = useState(key);

  // The server has no canvas, so it always renders null. A warm module cache
  // could otherwise make the client's first render return the processed image,
  // flipping the consumer's element (img vs placeholder) and tripping a
  // structural hydration mismatch. Stay null until mounted so the first client
  // render matches the server, then reveal the (already cached) image.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // When src/threshold change, adopt a newly cached value during render (a
  // React-supported state update) rather than syncing it from an effect. If the
  // new key isn't cached yet we keep the previous image until the pass finishes.
  if (key !== renderedKey) {
    setRenderedKey(key);
    const cached = cache.get(key);
    if (cached) setResult(cached);
  }

  useEffect(() => {
    if (cache.has(key)) return;

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
      const next = canvas.toDataURL("image/png");
      cache.set(key, next);
      setResult(next);
    };
    img.src = src;
  }, [key, src, threshold]);

  return mounted ? result : null;
}
