"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 한 화면에 한 장(min-w-full)씩 보여주는 슬라이더용 드래그/스와이프 훅.
 * - 손가락(또는 마우스)을 따라 트랙이 실시간으로 움직이고, 놓으면 가까운 슬라이드로 스냅됩니다.
 * - 세로 스크롤과 충돌하지 않도록 첫 움직임의 축을 잠급니다.
 * - 드래그 후 발생하는 클릭(카드 링크 이동)은 억제합니다.
 *
 * viewport 요소에 `handlers`를 펼쳐 붙이고, 내부 flex 트랙에 `trackStyle`을 적용하세요.
 */
export function useDragCarousel({
  length,
  auto = false,
  interval = 4000,
  paused = false,
} = {}) {
  const total = Math.max(1, length || 1);

  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  const viewportRef = useRef(null);
  const startX = useRef(null);
  const startY = useRef(null);
  const widthRef = useRef(0);
  const axisRef = useRef(null);
  const movedRef = useRef(false);

  // 슬라이드 개수가 줄어들면 인덱스 보정 (렌더 중 보정 패턴)
  if (index > total - 1) {
    setIndex(total - 1);
  }

  // 자동 넘김 (드래그 중이거나 일시정지면 멈춤)
  useEffect(() => {
    if (!auto || paused || dragging || total <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, interval);
    return () => clearInterval(timer);
  }, [auto, paused, dragging, total, interval]);

  const onPointerDown = useCallback(
    (e) => {
      if (total <= 1) return;
      // 마우스는 좌클릭만
      if (e.pointerType === "mouse" && e.button !== 0) return;
      startX.current = e.clientX;
      startY.current = e.clientY;
      widthRef.current =
        viewportRef.current?.offsetWidth || window.innerWidth || 1;
      axisRef.current = null;
      movedRef.current = false;
      setDragging(true);
    },
    [total],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      if (axisRef.current === null) {
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
          axisRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        } else {
          return;
        }
      }
      if (axisRef.current === "y") return; // 세로 스크롤은 방해하지 않음

      if (Math.abs(dx) > 4) movedRef.current = true;

      // 양 끝에서는 저항감(고무줄)
      let offset = dx;
      if ((index === 0 && dx > 0) || (index === total - 1 && dx < 0)) {
        offset = dx * 0.35;
      }
      setDrag(offset);
    },
    [index, total],
  );

  const endDrag = useCallback(() => {
    if (startX.current === null) return;
    const width = widthRef.current || 1;
    const threshold = Math.min(72, width * 0.18);

    if (axisRef.current === "x") {
      if (drag <= -threshold && index < total - 1) setIndex(index + 1);
      else if (drag >= threshold && index > 0) setIndex(index - 1);
    }

    startX.current = null;
    startY.current = null;
    axisRef.current = null;
    setDrag(0);
    setDragging(false);
  }, [drag, index, total]);

  // 드래그로 슬라이드를 넘긴 뒤 발생하는 클릭(링크 이동) 차단
  const onClickCapture = useCallback((e) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
    }
  }, []);

  const trackStyle = {
    transform: `translate3d(calc(${-index * 100}% + ${drag}px), 0, 0)`,
    transition: dragging
      ? "none"
      : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return {
    index,
    setIndex,
    total,
    dragging,
    viewportRef,
    trackStyle,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onPointerLeave: endDrag,
      onClickCapture,
      style: { touchAction: "pan-y" },
    },
  };
}
