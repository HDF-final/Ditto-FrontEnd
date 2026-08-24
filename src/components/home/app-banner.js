"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function isStandaloneDisplay() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return (
    window.matchMedia("(display-mode: standalone)")?.matches ||
    window.navigator?.standalone === true
  );
}

export function AppBanner() {
  const t = useTranslations("home");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandaloneDisplay);
  const [iosHint] = useState(() => {
    if (typeof window === "undefined") return false;
    const isIos =
      /iphone|ipad|ipod/i.test(window.navigator?.userAgent || "") &&
      !window.MSStream;
    return isIos && !isStandaloneDisplay();
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;

    function onBeforeInstall(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }

    function onInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", onInstalled);
      }
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <>
      {installed ? null : (
        <section className="bg-background px-5 py-8 lg:hidden">
          <div className="overflow-hidden rounded-[24px] bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] p-5">
            <h2 className="text-lg font-black text-white">{t("addToHomeTitle")}</h2>
            <p className="mt-1.5 text-[13px] leading-6 text-violet-100">
              {t("appDescription")}
            </p>
            {deferredPrompt ? (
              <button
                type="button"
                onClick={handleInstall}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#4a2fa8]"
              >
                {t("installNow")}
                <span aria-hidden="true">→</span>
              </button>
            ) : iosHint ? (
              <p className="mt-4 rounded-2xl bg-white/12 px-3.5 py-3 text-[12px] font-semibold leading-5 text-violet-50">
                {t("iosInstallHint")}
              </p>
            ) : (
              <p className="mt-4 text-[12px] font-semibold text-violet-100">
                {t("browserInstallHint")}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="hidden bg-background px-10 py-16 sm:px-14 lg:block lg:px-52 xl:px-60 2xl:px-72">
        <div className="overflow-hidden rounded-[32px] bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-10 py-12 sm:px-[60px]">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-[28px]">
                {t("appTitle")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-violet-100 sm:text-base">
                {t("appDescription")}
              </p>
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#4a2fa8]"
                >
                  {t("installNow")}
                  <span aria-hidden="true">→</span>
                </button>
              ) : iosHint ? (
                <p className="mt-6 inline-block rounded-2xl bg-white/12 px-4 py-3 text-[13px] font-semibold leading-5 text-violet-50">
                  {t("iosInstallHint")}
                </p>
              ) : (
                <p className="mt-6 text-[13px] font-semibold text-violet-100">
                  {t("browserInstallHint")}
                </p>
              )}
            </div>

            {/* Smartphone mockup */}
            <div className="hidden justify-self-center lg:block">
              <div className="relative h-[240px] w-[128px] rounded-[26px] border-[6px] border-slate-900/80 bg-slate-900 shadow-[0_24px_60px_rgba(20,10,60,0.45)]">
                <div className="absolute left-1/2 top-2 z-10 h-1 w-11 -translate-x-1/2 rounded-full bg-slate-700" />
                <div className="absolute inset-[3px] overflow-hidden rounded-[20px] bg-white">
                  <div className="flex items-center justify-between px-2.5 pb-1.5 pt-4">
                    <span className="text-[11px] font-black text-[#4a2fa8]">Ditto</span>
                    <span className="text-[9px] tracking-tight text-slate-300">●●●</span>
                  </div>
                  <div className="relative mx-2.5 mb-2.5 h-[176px] overflow-hidden rounded-lg bg-[#f4f1ea]">
                    <svg
                      viewBox="0 0 120 180"
                      className="h-full w-full"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <rect width="120" height="180" fill="#f4f1ea" />
                      <g fill="#e6e1d6">
                        <rect x="10" y="14" width="30" height="26" rx="3" />
                        <rect x="52" y="12" width="24" height="22" rx="3" />
                        <rect x="84" y="16" width="26" height="30" rx="3" />
                        <rect x="12" y="70" width="28" height="30" rx="3" />
                        <rect x="84" y="70" width="26" height="26" rx="3" />
                        <rect x="10" y="120" width="30" height="26" rx="3" />
                        <rect x="52" y="122" width="24" height="30" rx="3" />
                        <rect x="86" y="120" width="24" height="24" rx="3" />
                      </g>
                      <rect x="54" y="44" width="16" height="11" rx="2" fill="#bdeccd" />
                      <rect x="16" y="47" width="14" height="10" rx="2" fill="#f2a3c7" />
                      <polyline
                        points="48,168 48,108 80,108 80,63 100,63"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="1 7"
                      />
                      <circle cx="48" cy="168" r="6" fill="#b07d4a" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="100" cy="63" r="6" fill="#b07d4a" stroke="#ffffff" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
