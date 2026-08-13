"use client";

import {
  Html,
  Line,
  OrbitControls,
  OrthographicCamera,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import {
  FLOOR_DEFINITIONS,
  FLOOR_ORDER,
  loadFloorNavigation,
  loadNavigationManifest,
} from "@/lib/navigation/navigation-dataset";

const FLOOR_WIDTH = 100;
const DEFAULT_ASPECT_RATIO = 1500 / 2400;
const ROUTE_COLOR = "#10b981";
const ROUTE_PULSE_COLOR = "#ecfdf5";
const ROUTE_GLOW_LINE_WIDTH = 10;
const ROUTE_CORE_LINE_WIDTH = 5.5;
const ROUTE_PULSE_LINE_WIDTH = 2;
const ROUTE_PULSE_SPEED = 1.35;
const OVERVIEW_ZOOM_MULTIPLIER = 1.15;

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

function FloorTexture({ floor, flatView = false, onAspectRatioChange }) {
  const gl = useThree((state) => state.gl);
  const sourceTexture = useTexture(floor.imageUrl);
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

  const aspectRatio = useMemo(() => {
    const image = texture.image;
    const width = image?.naturalWidth || image?.width || 0;
    const height = image?.naturalHeight || image?.height || 0;
    return width > 0 ? height / width : DEFAULT_ASPECT_RATIO;
  }, [texture]);
  const depth = FLOOR_WIDTH * aspectRatio;

  useEffect(() => {
    onAspectRatioChange?.(aspectRatio);
  }, [aspectRatio, onAspectRatioChange]);

  return (
    <group
      position={flatView ? [0, floor.y, 0] : [floor.offsetX, floor.y, floor.offsetZ]}
      scale={flatView ? [1, 1, 1] : [floor.scale, 1, floor.scale]}
    >
      <mesh
        position={[0, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[FLOOR_WIDTH, depth]} />
        <meshBasicMaterial
          map={texture}
          color="#ffffff"
          toneMapped={false}
          side={THREE.FrontSide}
          transparent={floor.cutout}
          alphaTest={floor.cutout ? 0.03 : 0}
          opacity={1}
          depthWrite={!floor.cutout}
        />
      </mesh>
    </group>
  );
}

function FloorLabel({ floor }) {
  return (
    <Html
      position={[53, floor.y + 1.2, -31]}
      center
      sprite
      style={{ pointerEvents: "none" }}
      zIndexRange={[20, 0]}
    >
      <div
        className="whitespace-nowrap rounded-full bg-[#2f2458] px-2.5 py-1 text-[10px] font-bold text-white shadow-md"
      >
        {floor.id}
      </div>
    </Html>
  );
}

function toWorldPoint(node, floor, flatView) {
  const scale = flatView ? 1 : floor.scale;
  const offsetX = flatView ? 0 : floor.offsetX;
  const offsetZ = flatView ? 0 : floor.offsetZ;
  return [
    offsetX + (node.uv.u - 0.5) * FLOOR_WIDTH * scale,
    floor.y + 0.85,
    offsetZ + (node.uv.v - 0.5) * FLOOR_WIDTH * DEFAULT_ASPECT_RATIO * scale,
  ];
}

function RouteMarker({ position, label, destination = false }) {
  return (
    <Html
      position={position}
      center
      sprite
      style={{ pointerEvents: "none" }}
      zIndexRange={[40, 20]}
    >
      <div
        className={`whitespace-nowrap rounded-full border-2 border-white px-2 py-1 text-[10px] font-extrabold text-white shadow-md ${
          destination ? "bg-[#ff6b57]" : "bg-[#059669]"
        }`}
      >
        {label}
      </div>
    </Html>
  );
}

function RouteOverlay({ graph, itinerary, visibleFloors, flatView }) {
  const pulseLineRefs = useRef(new Map());
  const [motionAllowed, setMotionAllowed] = useState(() =>
    typeof window === "undefined"
      ? false
      : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setMotionAllowed(!query.matches);

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useFrame((_, delta) => {
    if (!motionAllowed) return;

    pulseLineRefs.current.forEach((line) => {
      if (line?.material) {
        line.material.dashOffset -= delta * ROUTE_PULSE_SPEED;
      }
    });
  });

  const routeGeometry = useMemo(() => {
    if (!graph || !itinerary) return null;
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
    const placesById = new Map(graph.places.map((place) => [place.id, place]));
    const floorsById = new Map(visibleFloors.map((floor) => [floor.id, floor]));
    const segments = [];
    const connectors = [];

    itinerary.legs.forEach((leg) => {
      leg.route.floorSegments.forEach((segment, segmentIndex) => {
        const floor = floorsById.get(segment.floorId);
        if (!floor || segment.nodeIds.length < 2) return;
        const points = segment.nodeIds
          .map((nodeId) => nodesById.get(nodeId))
          .filter(Boolean)
          .map((node) => toWorldPoint(node, floor, flatView));
        if (points.length >= 2) {
          segments.push({
            key: `${leg.index}-${segmentIndex}-${segment.floorId}`,
            points,
          });
        }
      });

      if (!flatView) {
        leg.route.connectorSteps.forEach((step, connectorIndex) => {
          const fromNode = nodesById.get(step.fromNodeId);
          const toNode = nodesById.get(step.toNodeId);
          const fromFloor = floorsById.get(step.fromFloor);
          const toFloor = floorsById.get(step.toFloor);
          if (!fromNode || !toNode || !fromFloor || !toFloor) return;
          connectors.push({
            key: `${leg.index}-${connectorIndex}-${step.connectorId}`,
            points: [
              toWorldPoint(fromNode, fromFloor, false),
              toWorldPoint(toNode, toFloor, false),
            ],
          });
        });
      }
    });

    const markers = itinerary.stopPlaceIds.flatMap((placeId, index) => {
      const place = placesById.get(placeId);
      const node = place ? nodesById.get(place.nodeId) : null;
      const floor = place?.floorId ? floorsById.get(place.floorId) : null;
      if (!node || !floor) return [];
      const lastIndex = itinerary.stopPlaceIds.length - 1;
      return [
        {
          key: placeId,
          position: toWorldPoint(node, floor, flatView),
          label: index === 0 ? "출발" : index === lastIndex ? "도착" : String(index),
          destination: index === lastIndex,
        },
      ];
    });

    return { segments, connectors, markers };
  }, [flatView, graph, itinerary, visibleFloors]);

  if (!routeGeometry) return null;

  return (
    <>
      {[...routeGeometry.segments, ...routeGeometry.connectors].map((line) => (
        <group key={line.key}>
          <Line
            points={line.points}
            color={ROUTE_COLOR}
            lineWidth={ROUTE_GLOW_LINE_WIDTH}
            transparent
            opacity={0.16}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
            renderOrder={12}
          />
          <Line
            points={line.points}
            color={ROUTE_COLOR}
            lineWidth={ROUTE_CORE_LINE_WIDTH}
            transparent
            opacity={0.92}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
            renderOrder={13}
          />
          <Line
            ref={(value) => {
              if (value) pulseLineRefs.current.set(line.key, value);
              else pulseLineRefs.current.delete(line.key);
            }}
            points={line.points}
            color={ROUTE_PULSE_COLOR}
            lineWidth={ROUTE_PULSE_LINE_WIDTH}
            dashed
            dashScale={1}
            dashSize={1.35}
            gapSize={2.25}
            transparent
            opacity={0.94}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
            renderOrder={14}
          />
        </group>
      ))}
      {routeGeometry.markers.map(({ key, ...marker }) => (
        <RouteMarker key={key} {...marker} />
      ))}
    </>
  );
}

function MapCamera({ viewMode, visibleFloors, singleFloorAspectRatio }) {
  const { size } = useThree();
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const singleFloor = viewMode === "floor" ? visibleFloors[0] : null;
  const firstFloor = visibleFloors[0];
  const lastFloor = visibleFloors.at(-1);
  const focusY = singleFloor?.y ??
    ((firstFloor?.y ?? 0) + (lastFloor?.y ?? 0)) / 2;
  const targetZoom = singleFloor
    ? Math.max(
        2.4,
        Math.min(
          (size.width * 0.86) / FLOOR_WIDTH,
          (size.height * 0.84) / (FLOOR_WIDTH * singleFloorAspectRatio),
        ),
      )
    : Math.max(2.2, Math.min(size.width / 150, size.height / 120)) *
      OVERVIEW_ZOOM_MULTIPLIER;

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const target = new THREE.Vector3(0, focusY, 0);
    const offset = singleFloor
      ? new THREE.Vector3(0, 118, 0.001)
      : new THREE.Vector3(94, 104, 126);
    const position = target.clone().add(offset);
    const up = singleFloor
      ? new THREE.Vector3(0, 0, -1)
      : new THREE.Vector3(0, 1, 0);

    camera.position.copy(position);
    camera.up.copy(up);
    camera.zoom = targetZoom;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    controls.target.copy(target);
    controls.update();
  }, [focusY, singleFloor, size.height, size.width, targetZoom]);

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
        enablePan={Boolean(singleFloor)}
        enableRotate={!singleFloor}
        enableZoom
        minPolarAngle={singleFloor ? 0 : 0.14}
        maxPolarAngle={singleFloor ? Math.PI : Math.PI * 0.47}
        minAzimuthAngle={singleFloor ? -Infinity : -Math.PI * 0.48}
        maxAzimuthAngle={singleFloor ? Infinity : Math.PI * 0.48}
        minZoom={1.5}
        maxZoom={14}
        rotateSpeed={0.62}
        zoomSpeed={0.72}
        mouseButtons={
          singleFloor
            ? {
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN,
              }
            : undefined
        }
      />
    </>
  );
}

function FloorStack({
  viewMode,
  visibleFloors,
  resetSignal,
  route,
  routeGraph,
}) {
  const [singleFloorAspectRatio, setSingleFloorAspectRatio] = useState(
    DEFAULT_ASPECT_RATIO,
  );

  return (
    <>
      <ambientLight intensity={1.4} />
      {visibleFloors.map((floor) => (
        <group key={floor.id}>
          <FloorTexture
            floor={floor}
            flatView={viewMode === "floor"}
            onAspectRatioChange={
              viewMode === "floor" ? setSingleFloorAspectRatio : undefined
            }
          />
          {viewMode !== "floor" ? <FloorLabel floor={floor} /> : null}
        </group>
      ))}
      <RouteOverlay
        graph={routeGraph}
        itinerary={route}
        visibleFloors={visibleFloors}
        flatView={viewMode === "floor"}
      />
      <MapCamera
        key={`${viewMode}-${visibleFloors.map((floor) => floor.id).join("-")}-${resetSignal}`}
        viewMode={viewMode}
        visibleFloors={visibleFloors}
        singleFloorAspectRatio={singleFloorAspectRatio}
      />
    </>
  );
}

function FloorSelector({ selectedView, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const selectedFloor = FLOOR_DEFINITIONS.find(
    (floor) => floor.id === selectedView,
  );
  const currentLabel =
    selectedView === "route"
      ? "경로층"
      : selectedView === "all"
        ? "전체층"
        : `${selectedFloor?.id} · ${selectedFloor?.title}`;

  const selectView = (view) => {
    onSelect(view);
    setExpanded(false);
  };

  return (
    <div className="absolute right-3 top-3 z-10 w-[220px] rounded-[20px] border border-white/80 bg-white/95 p-3 shadow-[0_14px_38px_rgba(46,29,101,0.14)] backdrop-blur-md md:right-5 md:top-5 md:w-[240px]">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#f7f5fb]"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-bold tracking-[0.22em] text-[#9994ad]">
            FLOOR
          </span>
          <span className="mt-1 block truncate text-[14px] font-bold text-[#251c46]">
            {currentLabel}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`ml-2 text-[14px] text-[#6b6685] transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {expanded ? (
        <div className="mt-1.5 grid grid-cols-2 gap-1.5 border-t border-[#eeeaf6] pt-2.5">
          {[
            { id: "route", label: "경로층" },
            { id: "all", label: "전체층" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={selectedView === item.id}
              onClick={() => selectView(item.id)}
              className={`rounded-xl px-2.5 py-2.5 text-[12px] font-bold transition-colors ${
                selectedView === item.id
                  ? "bg-[#2f7f70] text-white"
                  : "bg-[#f4f5f2] text-[#5f655f] hover:bg-[#e9eee9]"
              }`}
            >
              {item.label}
            </button>
          ))}

          {[...FLOOR_DEFINITIONS].reverse().map((floor) => (
            <button
              key={floor.id}
              type="button"
              aria-label={`${floor.id} ${floor.title} 단면 지도 보기`}
              aria-pressed={selectedView === floor.id}
              onClick={() => selectView(floor.id)}
              className={`rounded-xl px-2 py-2 text-center transition-colors ${
                selectedView === floor.id
                  ? "bg-[#2f7f70] text-white"
                  : "bg-[#f4f5f2] text-[#626762] hover:bg-[#e9eee9]"
              }`}
            >
              <span className="block text-[12px] font-extrabold leading-tight">
                {floor.id}
              </span>
              <span className="mt-1 block truncate text-[10px] font-semibold leading-tight opacity-85">
                {floor.title}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function IndoorMap({ route, routeFloorIds = FLOOR_ORDER, routeGraph }) {
  const [selectedView, setSelectedView] = useState("all");
  const [resetSignal, setResetSignal] = useState(0);
  const [datasetStatus, setDatasetStatus] = useState("loading");
  const routeFloorIdSet = useMemo(
    () =>
      new Set(
        routeFloorIds.filter((floorId) => FLOOR_ORDER.includes(floorId)),
      ),
    [routeFloorIds],
  );
  const viewMode = FLOOR_ORDER.includes(selectedView) ? "floor" : selectedView;
  const visibleFloors = useMemo(() => {
    const floors =
      viewMode === "floor"
        ? FLOOR_DEFINITIONS.filter((floor) => floor.id === selectedView)
        : viewMode === "route"
          ? FLOOR_DEFINITIONS.filter((floor) => routeFloorIdSet.has(floor.id))
          : FLOOR_DEFINITIONS;

    if (viewMode !== "route") return floors;

    return floors.map((floor, index) => ({ ...floor, y: index * 8.7 }));
  }, [routeFloorIdSet, selectedView, viewMode]);

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
        <div
          className={
            viewMode === "floor"
              ? "absolute bottom-[82px] left-0 right-0 top-0 cursor-grab active:cursor-grabbing md:bottom-[92px] md:right-[252px]"
              : "absolute inset-0"
          }
        >
          <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <FloorStack
                viewMode={viewMode}
                visibleFloors={visibleFloors}
                resetSignal={resetSignal}
                route={route}
                routeGraph={routeGraph}
              />
            </Suspense>
          </Canvas>
        </div>

        <FloorSelector selectedView={selectedView} onSelect={setSelectedView} />

        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[9px] font-medium text-[#6b6685] shadow-sm backdrop-blur-md md:bottom-5 md:text-[10px]">
          {viewMode === "floor"
            ? "드래그 이동 · 스크롤 확대/축소"
            : "드래그 회전 · 스크롤 확대/축소"}
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
