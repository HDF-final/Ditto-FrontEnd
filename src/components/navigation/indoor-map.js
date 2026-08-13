"use client";

import {
  Html,
  OrbitControls,
  OrthographicCamera,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  FLOOR_DEFINITIONS,
  FLOOR_ORDER,
  loadFloorNavigation,
  loadNavigationManifest,
} from "@/lib/navigation/navigation-dataset";

const FLOOR_WIDTH = 100;
const DEFAULT_ASPECT_RATIO = 1500 / 2400;

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-[#f7f5ff] px-6 text-center">
          <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
            <p className="text-sm font-bold text-[#1a142e]">
              지도를 불러오지 못했습니다
            </p>
            <p className="mt-1 text-xs text-[#6b6685]">
              잠시 후 페이지를 다시 열어주세요.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function FloorTexture({ floor, focusedFloorId }) {
  const gl = useThree((state) => state.gl);
  const sourceTexture = useTexture(floor.imageUrl);
  const focusActive = focusedFloorId !== null;
  const focused = focusedFloorId === floor.id;
  const dimmed = focusActive && !focused;
  const texture = useMemo(() => {
    const configuredTexture = sourceTexture.clone();
    configuredTexture.colorSpace = THREE.SRGBColorSpace;
    configuredTexture.anisotropy = Math.min(
      8,
      gl.capabilities.getMaxAnisotropy(),
    );
    configuredTexture.minFilter = THREE.LinearMipmapLinearFilter;
    configuredTexture.magFilter = THREE.LinearFilter;
    configuredTexture.needsUpdate = true;
    return configuredTexture;
  }, [gl, sourceTexture]);

  useEffect(() => () => texture.dispose(), [texture]);

  const depth = useMemo(() => {
    const image = texture.image;
    const width = image?.naturalWidth || image?.width || 0;
    const height = image?.naturalHeight || image?.height || 0;
    return FLOOR_WIDTH * (width > 0 ? height / width : DEFAULT_ASPECT_RATIO);
  }, [texture]);

  return (
    <group
      position={[floor.offsetX, floor.y, floor.offsetZ]}
      scale={[floor.scale, 1, floor.scale]}
    >
      <mesh
        position={[0, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={focused ? 10 : dimmed ? 1 : 2}
      >
        <planeGeometry args={[FLOOR_WIDTH, depth]} />
        <meshBasicMaterial
          map={texture}
          color="#ffffff"
          toneMapped={false}
          side={THREE.FrontSide}
          transparent={dimmed || floor.cutout}
          alphaTest={floor.cutout ? 0.03 : 0}
          opacity={dimmed ? 0.055 : 1}
          depthTest={!focused}
          depthWrite={!dimmed && !floor.cutout}
        />
      </mesh>
    </group>
  );
}

function FloorLabel({ floor, focusedFloorId }) {
  const dimmed = focusedFloorId !== null && focusedFloorId !== floor.id;

  return (
    <Html
      position={[-53, floor.y + 1.2, -31]}
      center
      sprite
      style={{ pointerEvents: "none" }}
      zIndexRange={[20, 0]}
    >
      <div
        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold shadow-md transition-opacity duration-300 ${
          dimmed
            ? "bg-[#d8d4e4] text-white opacity-20"
            : "bg-[#2f2458] text-white"
        }`}
      >
        {floor.id}
      </div>
    </Html>
  );
}

function MapCamera({ focusedFloorId, resetSignal }) {
  const { size } = useThree();
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const transitionRef = useRef(true);
  const focusedFloor = FLOOR_DEFINITIONS.find(
    (floor) => floor.id === focusedFloorId,
  );
  const focusY = focusedFloor?.y ??
    (FLOOR_DEFINITIONS[0].y + FLOOR_DEFINITIONS.at(-1).y) / 2;
  const targetZoom = focusedFloor
    ? Math.max(2.15, Math.min(size.width / 132, size.height / 82))
    : Math.max(1.85, Math.min(size.width / 154, size.height / 112));

  useEffect(() => {
    transitionRef.current = true;
  }, [focusedFloorId, resetSignal, size.height, size.width]);

  useFrame((_, delta) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || !transitionRef.current) return;

    const target = new THREE.Vector3(0, focusY, 0);
    const offset = focusedFloor
      ? new THREE.Vector3(78, 82, 104)
      : new THREE.Vector3(94, 104, 126);
    const position = target.clone().add(offset);
    const smoothing = 7;
    const alpha = 1 - Math.exp(-smoothing * delta);

    controls.target.lerp(target, alpha);
    camera.position.lerp(position, alpha);
    camera.zoom = THREE.MathUtils.damp(
      camera.zoom,
      targetZoom,
      smoothing,
      delta,
    );
    camera.updateProjectionMatrix();
    controls.update();

    if (
      camera.position.distanceTo(position) < 0.03 &&
      controls.target.distanceTo(target) < 0.02 &&
      Math.abs(camera.zoom - targetZoom) < 0.01
    ) {
      camera.position.copy(position);
      controls.target.copy(target);
      camera.zoom = targetZoom;
      camera.updateProjectionMatrix();
      transitionRef.current = false;
    }
  });

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[94, 104, 126]}
        near={0.1}
        far={500}
        zoom={2}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        enableRotate
        enableZoom
        minPolarAngle={0.22}
        maxPolarAngle={Math.PI * 0.47}
        minZoom={1.5}
        maxZoom={14}
        rotateSpeed={0.62}
        zoomSpeed={0.72}
      />
    </>
  );
}

function FloorStack({ focusedFloorId, resetSignal }) {
  return (
    <>
      <ambientLight intensity={1.4} />
      {FLOOR_DEFINITIONS.map((floor) => (
        <group key={floor.id}>
          <FloorTexture floor={floor} focusedFloorId={focusedFloorId} />
          <FloorLabel floor={floor} focusedFloorId={focusedFloorId} />
        </group>
      ))}
      <MapCamera focusedFloorId={focusedFloorId} resetSignal={resetSignal} />
    </>
  );
}

export function IndoorMap() {
  const [focusedFloorId, setFocusedFloorId] = useState(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [datasetStatus, setDatasetStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      loadNavigationManifest({ signal: controller.signal }),
      ...FLOOR_ORDER.map((floorId) =>
        loadFloorNavigation(floorId, { signal: controller.signal }),
      ),
    ])
      .then(([manifest, ...floors]) => {
        const storeCount = floors.reduce(
          (total, floor) =>
            total +
            floor.places.filter((place) => place.placeType === "STORE").length,
          0,
        );

        if (
          floors.length !== FLOOR_ORDER.length ||
          storeCount !== manifest.summary.storePlaceCount
        ) {
          throw new Error("Navigation dataset summary mismatch");
        }

        setDatasetStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setDatasetStatus("error");
      });

    return () => controller.abort();
  }, []);

  if (datasetStatus === "loading") {
    return (
      <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-[#f7f5ff]">
        <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#6b6685] shadow-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#5c2ef5]" />
          지도 원장 데이터를 확인하는 중
        </div>
      </div>
    );
  }

  if (datasetStatus === "error") {
    return (
      <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-[#f7f5ff] px-6 text-center">
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-bold text-[#1a142e]">
            지도 원장 데이터를 확인할 수 없습니다
          </p>
          <p className="mt-1 text-xs text-[#6b6685]">
            잠시 후 페이지를 다시 열어주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <div className="relative h-full min-h-[260px] w-full bg-[radial-gradient(circle_at_center,#ffffff_0%,#f7f5ff_52%,#f0ecfa_100%)]">
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <FloorStack
              focusedFloorId={focusedFloorId}
              resetSignal={resetSignal}
            />
          </Suspense>
        </Canvas>

        <div className="absolute right-3 top-3 z-10 flex max-h-[calc(100%-24px)] flex-col gap-1 overflow-y-auto rounded-2xl border border-white/70 bg-white/90 p-2 shadow-[0_12px_35px_rgba(46,29,101,0.12)] backdrop-blur-md md:right-5 md:top-5">
          <span className="px-2 pb-1 text-[8px] font-bold tracking-[0.22em] text-[#9994ad]">
            FLOOR
          </span>
          <button
            type="button"
            aria-pressed={focusedFloorId === null}
            onClick={() => setFocusedFloorId(null)}
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition-colors ${
              focusedFloorId === null
                ? "bg-[#5c2ef5] text-white"
                : "bg-[#f4f1fb] text-[#6b6685] hover:bg-[#ebe6f8]"
            }`}
          >
            전체
          </button>
          {[...FLOOR_ORDER].reverse().map((floorId) => (
            <button
              key={floorId}
              type="button"
              aria-label={`${floorId} ${FLOOR_DEFINITIONS.find((floor) => floor.id === floorId)?.title} 집중 보기`}
              aria-pressed={focusedFloorId === floorId}
              onClick={() => setFocusedFloorId(floorId)}
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition-colors ${
                focusedFloorId === floorId
                  ? "bg-[#5c2ef5] text-white"
                  : "bg-[#f4f1fb] text-[#6b6685] hover:bg-[#ebe6f8]"
              }`}
              title={FLOOR_DEFINITIONS.find((floor) => floor.id === floorId)?.title}
            >
              {floorId}
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[9px] font-medium text-[#6b6685] shadow-sm backdrop-blur-md md:bottom-5 md:text-[10px]">
          드래그 회전 · 스크롤 확대/축소
        </div>

        <button
          type="button"
          onClick={() => setResetSignal((value) => value + 1)}
          className="absolute bottom-3 left-3 z-10 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[9px] font-semibold text-[#6b6685] shadow-sm transition-colors hover:text-[#5c2ef5] md:bottom-5 md:left-5 md:text-[10px]"
        >
          시점 초기화
        </button>
      </div>
    </MapErrorBoundary>
  );
}
