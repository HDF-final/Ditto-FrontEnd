"use client";

import { useEffect, useRef } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const WHEEL_GESTURE_IDLE_MS = 260;
const MIN_GESTURE_LOCK_MS = 620;
const WHEEL_TRIGGER_THRESHOLD = 28;
const REVERSE_GESTURE_THRESHOLD = 48;
const TRANSITION_DURATION_MS = 540;

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

function normalizeWheelDelta(event, pageHeight) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * pageHeight;
  return event.deltaY;
}

function canScrollLockedTarget(event) {
  const lockedTarget = event.target?.closest?.("[data-home-snap-scroll-lock]");
  if (!lockedTarget) return false;

  const wheelDelta = normalizeWheelDelta(event, lockedTarget.clientHeight || 1);
  if (wheelDelta > 0) {
    return (
      lockedTarget.scrollTop + lockedTarget.clientHeight <
      lockedTarget.scrollHeight - 1
    );
  }

  return lockedTarget.scrollTop > 1;
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
    let gestureHandledAt = 0;
    let animating = false;
    let activePanelIndex = 0;
    let lastWheelAt = 0;
    let pendingWheelDelta = 0;
    let resizePending = false;
    let gestureDirection = 0;
    let reverseWheelDelta = 0;
    let queuedDirection = 0;

    function scheduleGestureRelease() {
      window.clearTimeout(gestureIdleTimer);

      if (!gestureHandled) return;

      const now = performance.now();
      const remainingIdleTime = Math.max(
        0,
        WHEEL_GESTURE_IDLE_MS - (now - lastWheelAt),
      );
      const remainingLockTime = Math.max(
        0,
        MIN_GESTURE_LOCK_MS - (now - gestureHandledAt),
      );

      gestureIdleTimer = window.setTimeout(() => {
        if (animating) {
          scheduleGestureRelease();
          return;
        }

        const releaseAt = performance.now();
        const wheelIsStillMoving =
          releaseAt - lastWheelAt < WHEEL_GESTURE_IDLE_MS;
        const minimumLockIsActive =
          releaseAt - gestureHandledAt < MIN_GESTURE_LOCK_MS;

        if (wheelIsStillMoving || minimumLockIsActive) {
          scheduleGestureRelease();
          return;
        }

        gestureHandled = false;
        gestureHandledAt = 0;
        pendingWheelDelta = 0;
        gestureDirection = 0;
        reverseWheelDelta = 0;
        queuedDirection = 0;

        if (resizePending) {
          resizePending = false;
          scheduleRealign();
        }
      }, Math.max(16, remainingIdleTime, remainingLockTime));
    }

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

    function moveOnePanel(direction, startedAt = performance.now()) {
      const panels = getPanels();
      if (panels.length === 0) return;

      const currentIndex = getNearestPanelIndex(panels);
      const targetIndex = Math.max(
        0,
        Math.min(panels.length - 1, currentIndex + direction),
      );

      activePanelIndex = currentIndex;
      gestureHandled = true;
      gestureHandledAt = startedAt;
      gestureDirection = direction;
      pendingWheelDelta = 0;
      reverseWheelDelta = 0;
      window.clearTimeout(gestureIdleTimer);

      if (targetIndex === currentIndex) {
        scheduleGestureRelease();
        return;
      }

      animateToPanel(panels[targetIndex], targetIndex);
    }

    function animateToPanel(panel, panelIndex) {
      const startTop = scroller.scrollTop;
      const targetTop = getPanelScrollTop(panel);
      const distance = targetTop - startTop;
      activePanelIndex = panelIndex;

      if (reducedMotionMedia.matches || Math.abs(distance) < 1) {
        scroller.scrollTo({ top: targetTop, behavior: "auto" });
        scheduleGestureRelease();
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
        if (queuedDirection !== 0) {
          const nextDirection = queuedDirection;
          queuedDirection = 0;
          moveOnePanel(nextDirection);
          return;
        }

        scheduleGestureRelease();
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

      if (canScrollLockedTarget(event)) {
        return;
      }

      event.preventDefault();
      const wheelAt = performance.now();
      const gestureWasIdle =
        lastWheelAt === 0 || wheelAt - lastWheelAt >= WHEEL_GESTURE_IDLE_MS;
      const wheelDelta = normalizeWheelDelta(event, scroller.clientHeight);
      const wheelDirection = wheelDelta > 0 ? 1 : -1;
      lastWheelAt = wheelAt;
      scheduleGestureRelease();

      if (animating || gestureHandled) {
        if (queuedDirection !== 0) return;

        if (gestureDirection === 0 || wheelDirection === gestureDirection) {
          reverseWheelDelta = 0;
          return;
        }

        if (
          reverseWheelDelta !== 0 &&
          Math.sign(reverseWheelDelta) !== wheelDirection
        ) {
          reverseWheelDelta = 0;
        }

        reverseWheelDelta += wheelDelta;
        if (Math.abs(reverseWheelDelta) < REVERSE_GESTURE_THRESHOLD) return;

        reverseWheelDelta = 0;
        if (animating) {
          queuedDirection = wheelDirection;
          return;
        }

        moveOnePanel(wheelDirection, wheelAt);
        return;
      }

      if (gestureWasIdle) pendingWheelDelta = 0;

      if (
        pendingWheelDelta !== 0 &&
        Math.sign(pendingWheelDelta) !== Math.sign(wheelDelta)
      ) {
        pendingWheelDelta = 0;
      }

      pendingWheelDelta += wheelDelta;
      if (Math.abs(pendingWheelDelta) < WHEEL_TRIGGER_THRESHOLD) return;

      const direction = pendingWheelDelta > 0 ? 1 : -1;
      moveOnePanel(direction, wheelAt);
    }

    function handleScroll() {
      if (animating || !desktopMedia.matches) return;
      const panels = getPanels();
      if (panels.length === 0) return;
      activePanelIndex = getNearestPanelIndex(panels);
    }

    function realignCurrentPanel() {
      if (!desktopMedia.matches) return;

      if (animating || gestureHandled) {
        resizePending = true;
        return;
      }

      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(gestureIdleTimer);
      scroller.classList.remove("home-snap-moving");
      animating = false;

      const panels = getPanels();
      if (panels.length === 0) return;

      activePanelIndex = getNearestPanelIndex(panels);
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
      className="home-snap bg-background max-lg:bg-surface-soft"
    >
      {children}
    </main>
  );
}
