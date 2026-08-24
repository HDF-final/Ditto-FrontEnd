"use client";

import { useCallback, useEffect, useState } from "react";

export function useAdminTrendArtifact(loader) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (nextError) {
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    let active = true;

    loader()
      .then((nextData) => {
        if (active) setData(nextData);
      })
      .catch((nextError) => {
        if (active) setError(nextError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loader]);

  return { data, error, loading, reload };
}
