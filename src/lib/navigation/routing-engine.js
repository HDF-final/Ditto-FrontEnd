export const DEFAULT_CONNECTOR_COST_POLICY = {
  elevatorPerFloor: 120,
  escalatorPerFloor: 80,
};

class MinHeap {
  constructor() {
    this.values = [];
  }

  get size() {
    return this.values.length;
  }

  push(entry) {
    this.values.push(entry);
    let index = this.values.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.values[parentIndex].distance <= this.values[index].distance) break;
      [this.values[parentIndex], this.values[index]] = [
        this.values[index],
        this.values[parentIndex],
      ];
      index = parentIndex;
    }
  }

  pop() {
    if (this.values.length === 0) return undefined;
    const first = this.values[0];
    const last = this.values.pop();
    if (this.values.length > 0 && last) {
      this.values[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (
          left < this.values.length &&
          this.values[left].distance < this.values[smallest].distance
        ) {
          smallest = left;
        }
        if (
          right < this.values.length &&
          this.values[right].distance < this.values[smallest].distance
        ) {
          smallest = right;
        }
        if (smallest === index) break;
        [this.values[smallest], this.values[index]] = [
          this.values[index],
          this.values[smallest],
        ];
        index = smallest;
      }
    }
    return first;
  }
}

function connectorEdgeId(type, id, fromFloor, toFloor) {
  const normalize = (value) => value.replaceAll(/[^A-Za-z0-9_-]/g, "_");
  return [
    "BUILDING",
    type.toUpperCase(),
    normalize(id),
    normalize(fromFloor),
    normalize(toFloor),
  ].join("_");
}

function allowedEscalatorDirections(direction) {
  if (direction === "both") return new Set(["up", "down"]);
  if (direction === "up" || direction === "down") return new Set([direction]);
  return new Set();
}

export function buildBuildingGraph(
  floors,
  floorOrder,
  costPolicy = DEFAULT_CONNECTOR_COST_POLICY,
) {
  if (
    !Number.isFinite(costPolicy.elevatorPerFloor) ||
    costPolicy.elevatorPerFloor < 0 ||
    !Number.isFinite(costPolicy.escalatorPerFloor) ||
    costPolicy.escalatorPerFloor < 0
  ) {
    throw new Error("Connector costs must be finite non-negative numbers.");
  }

  const floorIndexes = new Map(floorOrder.map((id, index) => [id, index]));
  const nodes = [];
  const edges = [];
  const places = [];
  const warnings = [];
  const nodeIds = new Set();
  const edgeIds = new Set();
  const placeIds = new Set();
  const connectorsByKey = new Map();

  for (const floor of floors) {
    if (!floorIndexes.has(floor.floorId)) {
      throw new Error(`Floor ${floor.floorId} is missing from floorOrder.`);
    }
    const floorNodeIds = new Set(floor.nodes.map((node) => node.id));
    for (const node of floor.nodes) {
      if (nodeIds.has(node.id)) throw new Error(`Duplicate node: ${node.id}`);
      nodeIds.add(node.id);
      nodes.push({ ...node, floorId: floor.floorId });
    }
    for (const edge of floor.edges) {
      if (edgeIds.has(edge.id)) throw new Error(`Duplicate edge: ${edge.id}`);
      if (!floorNodeIds.has(edge.from) || !floorNodeIds.has(edge.to)) {
        throw new Error(`Edge ${edge.id} references a node outside ${floor.floorId}.`);
      }
      edgeIds.add(edge.id);
      edges.push({ ...edge, floorId: floor.floorId });
    }
    for (const place of floor.places) {
      if (placeIds.has(place.id)) throw new Error(`Duplicate place: ${place.id}`);
      if (!floorNodeIds.has(place.nodeId)) {
        throw new Error(`Place ${place.id} references a missing node.`);
      }
      placeIds.add(place.id);
      places.push({ ...place, floorId: floor.floorId });
    }
    const scopedConnectorIds = new Set();
    for (const connector of floor.connectors) {
      if (!floorNodeIds.has(connector.nodeId)) {
        throw new Error(`Connector ${connector.id} references a missing node.`);
      }
      const key = `${connector.type}:${connector.id}`;
      if (scopedConnectorIds.has(key)) {
        throw new Error(`Duplicate ${key} on ${floor.floorId}.`);
      }
      scopedConnectorIds.add(key);
      const entries = connectorsByKey.get(key) ?? [];
      entries.push({ floorId: floor.floorId, connector });
      connectorsByKey.set(key, entries);
    }
  }

  const appendConnectorEdge = (edge) => {
    if (edgeIds.has(edge.id)) throw new Error(`Duplicate generated edge: ${edge.id}`);
    edgeIds.add(edge.id);
    edges.push(edge);
  };

  for (const entries of connectorsByKey.values()) {
    if (entries.length < 2) continue;
    entries.sort(
      (a, b) => floorIndexes.get(a.floorId) - floorIndexes.get(b.floorId),
    );
    const type = entries[0].connector.type;
    const id = entries[0].connector.id;

    if (type === "elevator") {
      for (let fromIndex = 0; fromIndex < entries.length; fromIndex += 1) {
        for (let toIndex = fromIndex + 1; toIndex < entries.length; toIndex += 1) {
          const from = entries[fromIndex];
          const to = entries[toIndex];
          const pair = [from.floorId, to.floorId];
          const bothServePair = [from, to].every((entry) =>
            pair.every((floorId) => entry.connector.servedFloors.includes(floorId)),
          );
          if (!bothServePair) continue;
          const floorDistance = Math.abs(
            floorIndexes.get(to.floorId) - floorIndexes.get(from.floorId),
          );
          appendConnectorEdge({
            id: connectorEdgeId(type, id, from.floorId, to.floorId),
            from: from.connector.nodeId,
            to: to.connector.nodeId,
            kind: "connector",
            bidirectional: true,
            weightPixels: costPolicy.elevatorPerFloor * floorDistance,
            connectorId: id,
            connectorType: type,
          });
        }
      }
      continue;
    }

    for (let index = 0; index < entries.length - 1; index += 1) {
      const lower = entries[index];
      const higher = entries[index + 1];
      if (floorIndexes.get(higher.floorId) - floorIndexes.get(lower.floorId) !== 1) {
        continue;
      }
      const lowerDirections = allowedEscalatorDirections(lower.connector.direction);
      const higherDirections = allowedEscalatorDirections(higher.connector.direction);
      const allowsUp = lowerDirections.has("up") && higherDirections.has("up");
      const allowsDown = lowerDirections.has("down") && higherDirections.has("down");
      if (!allowsUp && !allowsDown) {
        warnings.push(`Skipped escalator ${id}: incompatible direction.`);
        continue;
      }
      appendConnectorEdge({
        id: connectorEdgeId(type, id, lower.floorId, higher.floorId),
        from: allowsUp ? lower.connector.nodeId : higher.connector.nodeId,
        to: allowsUp ? higher.connector.nodeId : lower.connector.nodeId,
        kind: "connector",
        bidirectional: allowsUp && allowsDown,
        weightPixels: costPolicy.escalatorPerFloor,
        connectorId: id,
        connectorType: type,
      });
    }
  }

  return { nodes, edges, places, warnings };
}

function buildRouteDetails(graph, nodeIds, edgeIds) {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const edgesById = new Map(graph.edges.map((edge) => [edge.id, edge]));
  const floorSegments = [];
  const connectorSteps = [];
  const firstNode = nodesById.get(nodeIds[0]);
  if (!firstNode?.floorId) return { floorSegments, connectorSteps };

  let currentSegment = {
    floorId: firstNode.floorId,
    nodeIds: [firstNode.id],
    edgeIds: [],
  };
  for (let index = 0; index < edgeIds.length; index += 1) {
    const edge = edgesById.get(edgeIds[index]);
    const currentNode = nodesById.get(nodeIds[index]);
    const nextNode = nodesById.get(nodeIds[index + 1]);
    if (!edge || !currentNode?.floorId || !nextNode?.floorId) continue;
    if (edge.connectorId && edge.connectorType) {
      floorSegments.push(currentSegment);
      connectorSteps.push({
        connectorId: edge.connectorId,
        connectorType: edge.connectorType,
        fromFloor: currentNode.floorId,
        toFloor: nextNode.floorId,
        fromNodeId: currentNode.id,
        toNodeId: nextNode.id,
      });
      currentSegment = {
        floorId: nextNode.floorId,
        nodeIds: [nextNode.id],
        edgeIds: [],
      };
    } else if (nextNode.floorId !== currentSegment.floorId) {
      floorSegments.push(currentSegment);
      currentSegment = {
        floorId: nextNode.floorId,
        nodeIds: [nextNode.id],
        edgeIds: [],
      };
    } else {
      currentSegment.edgeIds.push(edge.id);
      currentSegment.nodeIds.push(nextNode.id);
    }
  }
  floorSegments.push(currentSegment);
  return { floorSegments, connectorSteps };
}

export function findShortestPath(graph, startPlaceId, destinationPlaceId, options = {}) {
  const start = graph.places.find((place) => place.id === startPlaceId);
  const destination = graph.places.find((place) => place.id === destinationPlaceId);
  if (!start || !destination) return null;
  if (start.nodeId === destination.nodeId) {
    const nodeIds = [start.nodeId];
    return {
      nodeIds,
      edgeIds: [],
      totalWeight: 0,
      ...buildRouteDetails(graph, nodeIds, []),
    };
  }

  const excluded = new Set(options.excludeConnectorTypes ?? []);
  const adjacency = new Map(graph.nodes.map((node) => [node.id, []]));
  for (const edge of graph.edges) {
    if (edge.connectorType && excluded.has(edge.connectorType)) continue;
    adjacency.get(edge.from)?.push({ nodeId: edge.to, edge });
    if (edge.bidirectional) adjacency.get(edge.to)?.push({ nodeId: edge.from, edge });
  }
  const distances = new Map([[start.nodeId, 0]]);
  const previous = new Map();
  const queue = new MinHeap();
  queue.push({ nodeId: start.nodeId, distance: 0 });

  while (queue.size > 0) {
    const current = queue.pop();
    if (!current || current.distance !== distances.get(current.nodeId)) continue;
    if (current.nodeId === destination.nodeId) break;
    for (const neighbor of adjacency.get(current.nodeId) ?? []) {
      const distance = current.distance + neighbor.edge.weightPixels;
      if (distance >= (distances.get(neighbor.nodeId) ?? Infinity)) continue;
      distances.set(neighbor.nodeId, distance);
      previous.set(neighbor.nodeId, {
        nodeId: current.nodeId,
        edgeId: neighbor.edge.id,
      });
      queue.push({ nodeId: neighbor.nodeId, distance });
    }
  }

  const totalWeight = distances.get(destination.nodeId);
  if (totalWeight === undefined) return null;
  const nodeIds = [destination.nodeId];
  const edgeIds = [];
  let currentNodeId = destination.nodeId;
  while (currentNodeId !== start.nodeId) {
    const step = previous.get(currentNodeId);
    if (!step) return null;
    edgeIds.push(step.edgeId);
    nodeIds.push(step.nodeId);
    currentNodeId = step.nodeId;
  }
  nodeIds.reverse();
  edgeIds.reverse();
  return {
    nodeIds,
    edgeIds,
    totalWeight,
    ...buildRouteDetails(graph, nodeIds, edgeIds),
  };
}

export function buildItineraryRoute(graph, stopPlaceIds, options = {}) {
  const stops = stopPlaceIds.filter(
    (id, index) => index === 0 || id !== stopPlaceIds[index - 1],
  );
  if (stops.length === 0) return null;
  const legs = [];
  for (let index = 0; index < stops.length - 1; index += 1) {
    const route = findShortestPath(graph, stops[index], stops[index + 1], options);
    if (!route) return null;
    legs.push({
      index,
      fromPlaceId: stops[index],
      toPlaceId: stops[index + 1],
      route,
    });
  }
  const floorIds = [];
  for (const leg of legs) {
    for (const segment of leg.route.floorSegments) {
      if (!floorIds.includes(segment.floorId)) floorIds.push(segment.floorId);
    }
  }
  if (legs.length === 0) {
    const place = graph.places.find((entry) => entry.id === stops[0]);
    if (place?.floorId) floorIds.push(place.floorId);
  }
  const connectorEntries = legs.flatMap((leg) =>
    leg.route.connectorSteps.map((step, connectorIndex) => ({
      legIndex: leg.index,
      connectorIndex,
      step,
    })),
  );
  return {
    stopPlaceIds: stops,
    legs,
    totalWeight: legs.reduce((sum, leg) => sum + leg.route.totalWeight, 0),
    floorIds,
    connectorSteps: connectorEntries.map((entry) => entry.step),
    connectorEntries,
  };
}

function pairKey(fromId, toId) {
  return `${fromId}\u0000${toId}`;
}

/**
 * Finds the minimum-cost course through every stop.
 *
 * `lockedIndexes` pins the stop currently at each supplied visit index. When
 * `preserveEndpoints` is enabled, the first and last stops are pinned as well.
 */
export function optimizeOpenItinerary(
  graph,
  stopPlaceIds,
  options = {},
  { lockedIndexes = [], preserveEndpoints = false } = {},
) {
  const stops = [...new Set(stopPlaceIds)];
  if (stops.length < 2) return { stopPlaceIds: stops, itinerary: buildItineraryRoute(graph, stops, options) };
  if (stops.length > 8) throw new Error("A course supports up to 8 places.");

  const pinnedIndexes = new Set(
    lockedIndexes.filter(
      (index) => Number.isInteger(index) && index >= 0 && index < stops.length,
    ),
  );
  if (preserveEndpoints) {
    pinnedIndexes.add(0);
    pinnedIndexes.add(stops.length - 1);
  }

  const canPlaceAt = (stopIndex, position) => {
    if (pinnedIndexes.has(position)) return stopIndex === position;
    return !pinnedIndexes.has(stopIndex);
  };

  const pairRoutes = new Map();
  for (const from of stops) {
    for (const to of stops) {
      if (from === to) continue;
      pairRoutes.set(pairKey(from, to), findShortestPath(graph, from, to, options));
    }
  }

  const size = 1 << stops.length;
  const costs = Array.from({ length: size }, () => Array(stops.length).fill(Infinity));
  const previous = Array.from({ length: size }, () => Array(stops.length).fill(-1));
  const visitedCounts = Array(size).fill(0);
  for (let mask = 1; mask < size; mask += 1) {
    visitedCounts[mask] = visitedCounts[mask >> 1] + (mask & 1);
  }
  for (let index = 0; index < stops.length; index += 1) {
    if (canPlaceAt(index, 0)) costs[1 << index][index] = 0;
  }

  for (let mask = 1; mask < size; mask += 1) {
    for (let last = 0; last < stops.length; last += 1) {
      if (!(mask & (1 << last)) || !Number.isFinite(costs[mask][last])) continue;
      for (let next = 0; next < stops.length; next += 1) {
        if (mask & (1 << next)) continue;
        if (!canPlaceAt(next, visitedCounts[mask])) continue;
        const route = pairRoutes.get(pairKey(stops[last], stops[next]));
        if (!route) continue;
        const nextMask = mask | (1 << next);
        const nextCost = costs[mask][last] + route.totalWeight;
        if (nextCost < costs[nextMask][next]) {
          costs[nextMask][next] = nextCost;
          previous[nextMask][next] = last;
        }
      }
    }
  }

  const fullMask = size - 1;
  let last = 0;
  for (let index = 1; index < stops.length; index += 1) {
    if (costs[fullMask][index] < costs[fullMask][last]) last = index;
  }
  if (!Number.isFinite(costs[fullMask][last])) return null;
  const order = [];
  let mask = fullMask;
  while (last >= 0) {
    order.push(stops[last]);
    const prior = previous[mask][last];
    mask ^= 1 << last;
    last = prior;
  }
  order.reverse();
  return {
    stopPlaceIds: order,
    itinerary: buildItineraryRoute(graph, order, options),
  };
}
