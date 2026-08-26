"use client";

import { useEffect, useRef } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const WHEEL_GESTURE_IDLE_MS = 60;
const TRANSITION_DURATION_MS = 540;

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

export function HomeSnapScroller({ children }) {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const desktopMedia = window.matchMedia(DESKTOP_QUERY);
    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    let animationFrame = 0;
    let gestureIdleTimer = 0;
    let resizeFrame = 0;
    let gestureHandled = false;
    let animating = false;
    let activePanelIndex = 0;

    function getPanels() {
      return Array.from(scroller.querySelectorAll(":scope > .home-snap-panel"));
    }

    function getPanelScrollTop(panel) {
      const scrollerTop = scroller.getBoundingClientRect().top;
      const panelTop = panel.getBoundingClientRect().top;
      return panelTop - scrollerTop + scroller.scrollTop;
    }

    function getNearestPanelIndex(panels) {
      return panels.reduce((nearestIndex, panel, index) => {
        const nearestDistance = Math.abs(
          getPanelScrollTop(panels[nearestIndex]) - scroller.scrollTop,
        );
        const currentDistance = Math.abs(
          getPanelScrollTop(panel) - scroller.scrollTop,
        );
        return currentDistance < nearestDistance ? index : nearestIndex;
      }, 0);
    }

    function animateToPanel(panel, panelIndex) {
      const startTop = scroller.scrollTop;
      const targetTop = getPanelScrollTop(panel);
      const distance = targetTop - startTop;
      activePanelIndex = panelIndex;

      if (reducedMotionMedia.matches || Math.abs(distance) < 1) {
        scroller.scrollTo({ top: targetTop, behavior: "auto" });
        gestureIdleTimer = window.setTimeout(() => {
          gestureHandled = false;
        }, WHEEL_GESTURE_IDLE_MS);
        return;
      }

      animating = true;
      scroller.classList.add("home-snap-moving");
      const startedAt = performance.now();

      function step(now) {
        const progress = Math.min(
          (now - startedAt) / TRANSITION_DURATION_MS,
          1,
        );
        const nextTop = startTop + distance * easeOutCubic(progress);
        scroller.scrollTo({ top: nextTop, behavior: "auto" });

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(step);
          return;
        }

        scroller.scrollTo({ top: targetTop, behavior: "auto" });
        scroller.classList.remove("home-snap-moving");
        animating = false;
        gestureIdleTimer = window.setTimeout(() => {
          gestureHandled = false;
        }, WHEEL_GESTURE_IDLE_MS);
      }

      animationFrame = window.requestAnimationFrame(step);
    }

    function handleWheel(event) {
      if (
        !desktopMedia.matches ||
        event.ctrlKey ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
        event.deltaY === 0
      ) {
        return;
      }

      event.preventDefault();
      if (animating || gestureHandled) return;

      const panels = getPanels();
      if (panels.length === 0) return;

      const currentIndex = getNearestPanelIndex(panels);
      const direction = event.deltaY > 0 ? 1 : -1;
      const targetIndex = Math.max(
        0,
        Math.min(panels.length - 1, currentIndex + direction),
      );

      if (targetIndex === currentIndex) return;

      gestureHandled = true;
      window.clearTimeout(gestureIdleTimer);
      animateToPanel(panels[targetIndex], targetIndex);
    }

    function handleScroll() {
      if (animating || !desktopMedia.matches) return;
      const panels = getPanels();
      if (panels.length === 0) return;
      activePanelIndex = getNearestPanelIndex(panels);
    }

    function realignCurrentPanel() {
      if (!desktopMedia.matches) return;

      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(gestureIdleTimer);
      scroller.classList.remove("home-snap-moving");
      animating = false;
      gestureHandled = false;

      const panels = getPanels();
      if (panels.length === 0) return;

      activePanelIndex = Math.max(
        0,
        Math.min(panels.length - 1, activePanelIndex),
      );
      scroller.scrollTo({
        top: getPanelScrollTop(panels[activePanelIndex]),
        behavior: "auto",
      });
    }

    function scheduleRealign() {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(realignCurrentPanel);
    }

    const resizeObserver = new ResizeObserver(scheduleRealign);
    const initialPanels = getPanels();
    if (initialPanels.length > 0) {
      activePanelIndex = getNearestPanelIndex(initialPanels);
    }

    resizeObserver.observe(scroller);
    scroller.addEventListener("wheel", handleWheel, { passive: false });
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", scheduleRealign);
    window.visualViewport?.addEventListener("resize", scheduleRealign);

    return () => {
      resizeObserver.disconnect();
      scroller.removeEventListener("wheel", handleWheel);
      scroller.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", scheduleRealign);
      window.visualViewport?.removeEventListener("resize", scheduleRealign);
      scroller.classList.remove("home-snap-moving");
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(gestureIdleTimer);
    };
  }, []);

  return (
    <main
      ref={scrollerRef}
      className="home-snap bg-background max-lg:space-y-5"
    >
      {children}
    </main>
  );
}
