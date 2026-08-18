"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Same registered floor space as indoor-map.js so models sit on the plan.
const FLOOR_WIDTH = 100;
const DEFAULT_ASPECT_RATIO = 1500 / 2400;
const LANDING_LIFT = 0.12;
// Keep the cabin flush with the vertical-circulation room band so it
// does not bulge above the floor volumes.
const ELEVATOR_HEIGHT = 2.15;
// Meet the lower plate at its surface and the upper plate from underneath
// so the run lives in the void between floors, not on top of the plan.
const ESCALATOR_LEAVE_FLUSH = 0.05;
const ESCALATOR_ARRIVE_UNDER = 0.08;

const ELEVATOR_BODY = "#5DA889";
const ELEVATOR_DOOR = "#2F2C29";
const ELEVATOR_LIGHT = "#00815a";

const ESCALATOR_DECK = "#E6E8EA";
const ESCALATOR_SKIRT = "#C8CDD1";
const ESCALATOR_TREAD = "#8B9197";
const ESCALATOR_GLASS = "#F4F6F7";
const ESCALATOR_HANDRAIL = "#3A3E42";
const ESCALATOR_CAP = "#D5D8DB";
const ESCALATOR_UP = "#2F6B56";

function nodeWorldPoint(node, floor, yLift = LANDING_LIFT) {
  return [
    floor.offsetX + (node.uv.u - 0.5) * FLOOR_WIDTH * floor.scale,
    floor.y + yLift,
    floor.offsetZ +
      (node.uv.v - 0.5) *
        FLOOR_WIDTH *
        (floor.aspect ?? DEFAULT_ASPECT_RATIO) *
        floor.scale,
  ];
}

function getActiveConnectors(itinerary) {
  const keys = new Set();
  const floorsByKey = new Map();
  const steps = [
    ...(itinerary?.connectorSteps ?? []),
    ...(itinerary?.legs ?? []).flatMap(
      (leg) => leg.route?.connectorSteps ?? [],
    ),
  ];
  for (const step of steps) {
    if (!step?.connectorId || !step?.connectorType) continue;
    const key = `${step.connectorType}:${step.connectorId}`;
    keys.add(key);
    const floors = floorsByKey.get(key) ?? new Set();
    if (step.fromFloor) floors.add(step.fromFloor);
    if (step.toFloor) floors.add(step.toFloor);
    floorsByKey.set(key, floors);
  }
  return { keys, floorsByKey };
}

function collectConnectors(visibleFloors, floorDatasets, itinerary) {
  if (!floorDatasets?.length) return { elevators: [], escalators: [] };

  const datasetsById = new Map(
    floorDatasets.map((dataset) => [dataset.floorId, dataset]),
  );
  const grouped = new Map();

  for (const floor of visibleFloors) {
    const dataset = datasetsById.get(floor.id);
    if (!dataset) continue;
    const nodesById = new Map(dataset.nodes.map((node) => [node.id, node]));
    for (const connector of dataset.connectors) {
      const node = nodesById.get(connector.nodeId);
      if (!node) continue;
      const key = `${connector.type}:${connector.id}`;
      const entries = grouped.get(key) ?? [];
      entries.push({
        floor,
        connector,
        node,
        point: nodeWorldPoint(node, floor),
      });
      grouped.set(key, entries);
    }
  }

  const active = getActiveConnectors(itinerary);
  if (!active.keys.size) return { elevators: [], escalators: [] };

  const elevators = [];
  const escalators = [];

  for (const [key, entries] of grouped) {
    if (!active.keys.has(key)) continue;
    const routeFloors = active.floorsByKey.get(key);
    const visible = entries.filter(
      (entry) =>
        entry.floor &&
        (!routeFloors?.size || routeFloors.has(entry.floor.id)),
    );
    if (!visible.length) continue;
    const type = key.startsWith("elevator:") ? "elevator" : "escalator";

    if (type === "elevator") {
      visible.sort((a, b) => a.floor.y - b.floor.y);
      elevators.push({
        id: key,
        landings: visible.map((entry) => ({
          floorId: entry.floor.id,
          point: entry.point,
        })),
      });
      continue;
    }

    const paired = entries.filter((entry) => entry.point);
    if (paired.length >= 2) {
      paired.sort((a, b) => a.floor.y - b.floor.y);
      const lower = paired[0];
      const upper = paired[paired.length - 1];
      escalators.push({
        id: key,
        start: [
          lower.point[0],
          lower.floor.y + ESCALATOR_LEAVE_FLUSH,
          lower.point[2],
        ],
        end: [
          upper.point[0],
          upper.floor.y - ESCALATOR_ARRIVE_UNDER,
          upper.point[2],
        ],
        goingUp: lower.connector.direction !== "down",
      });
    }
  }

  return { elevators, escalators };
}

function ElevatorCabin({ point }) {
  const yaw = Math.atan2(-point[0], -point[2]);
  return (
    <group position={point} rotation={[0, yaw, 0]}>
      <mesh position={[0, ELEVATOR_HEIGHT / 2, 0]} renderOrder={6}>
        <boxGeometry args={[1.55, ELEVATOR_HEIGHT, 1.55]} />
        <meshBasicMaterial color={ELEVATOR_BODY} toneMapped={false} />
      </mesh>
      <mesh position={[0, ELEVATOR_HEIGHT / 2 - 0.03, 0.8]} renderOrder={7}>
        <boxGeometry args={[0.72, 0.72, 0.08]} />
        <meshBasicMaterial color={ELEVATOR_DOOR} toneMapped={false} />
      </mesh>
      <mesh position={[0, ELEVATOR_HEIGHT - 0.08, 0.82]} renderOrder={8}>
        <boxGeometry args={[0.22, 0.07, 0.05]} />
        <meshBasicMaterial color={ELEVATOR_LIGHT} toneMapped={false} />
      </mesh>
    </group>
  );
}

function EscalatorBand({ start, end }) {
  const layout = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const mid = a.clone().lerp(b, 0.5);
    const dir = b.clone().sub(a);
    const rawLength = dir.length();
    if (rawLength < 0.001) dir.set(0, 1, 0);
    else dir.multiplyScalar(1 / rawLength);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      dir,
    );
    return {
      mid: [mid.x, mid.y, mid.z],
      quat,
      length: Math.max(rawLength, 0.6),
    };
  }, [start, end]);

  const width = 0.88;
  const run = layout.length;

  return (
    <group position={layout.mid} quaternion={layout.quat}>
      <mesh position={[0, -0.09, 0]} renderOrder={6}>
        <boxGeometry args={[width, 0.08, run]} />
        <meshBasicMaterial color={ESCALATOR_SKIRT} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.04, 0]} renderOrder={6}>
        <boxGeometry args={[width, 0.07, run]} />
        <meshBasicMaterial color={ESCALATOR_DECK} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.01, 0]} renderOrder={7}>
        <boxGeometry args={[width * 0.56, 0.035, run * 0.96]} />
        <meshBasicMaterial color={ESCALATOR_TREAD} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.03, 0]} renderOrder={7}>
        <boxGeometry args={[0.045, 0.02, run * 0.9]} />
        <meshBasicMaterial color={ESCALATOR_UP} toneMapped={false} />
      </mesh>
      <mesh position={[-width / 2 + 0.025, 0.24, 0]} renderOrder={7}>
        <boxGeometry args={[0.03, 0.42, run * 0.98]} />
        <meshBasicMaterial
          color={ESCALATOR_GLASS}
          transparent
          opacity={0.34}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[width / 2 - 0.025, 0.24, 0]} renderOrder={7}>
        <boxGeometry args={[0.03, 0.42, run * 0.98]} />
        <meshBasicMaterial
          color={ESCALATOR_GLASS}
          transparent
          opacity={0.34}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-width / 2 + 0.025, 0.46, 0]} renderOrder={8}>
        <boxGeometry args={[0.055, 0.04, run * 0.99]} />
        <meshBasicMaterial color={ESCALATOR_HANDRAIL} toneMapped={false} />
      </mesh>
      <mesh position={[width / 2 - 0.025, 0.46, 0]} renderOrder={8}>
        <boxGeometry args={[0.055, 0.04, run * 0.99]} />
        <meshBasicMaterial color={ESCALATOR_HANDRAIL} toneMapped={false} />
      </mesh>
      <mesh position={[-width / 2 + 0.025, 0.49, 0]} renderOrder={8}>
        <boxGeometry args={[0.03, 0.012, run * 0.97]} />
        <meshBasicMaterial color={ESCALATOR_CAP} toneMapped={false} />
      </mesh>
      <mesh position={[width / 2 - 0.025, 0.49, 0]} renderOrder={8}>
        <boxGeometry args={[0.03, 0.012, run * 0.97]} />
        <meshBasicMaterial color={ESCALATOR_CAP} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function CirculationModels({
  visibleFloors,
  floorDatasets,
  itinerary,
  flatView = false,
}) {
  const fixtures = useMemo(
    () => collectConnectors(visibleFloors, floorDatasets, itinerary),
    [visibleFloors, floorDatasets, itinerary],
  );

  if (!fixtures.elevators.length && !fixtures.escalators.length) return null;

  return (
    <group>
      {fixtures.elevators.map((elevator) => (
        <group key={elevator.id}>
          {elevator.landings.map((landing) => (
            <ElevatorCabin key={landing.floorId} point={landing.point} />
          ))}
        </group>
      ))}
      {fixtures.escalators.map((escalator) => {
        if (flatView) return null;
        return (
          <EscalatorBand
            key={escalator.id}
            start={escalator.start}
            end={escalator.end}
            goingUp={escalator.goingUp}
          />
        );
      })}
    </group>
  );
}
