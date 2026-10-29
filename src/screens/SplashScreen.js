import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Ellipse, Line, RadialGradient, Stop } from 'react-native-svg';

/** Right-facing profile. Neck at the bottom, nose is the rightmost point. */
const SILHOUETTE = [
  [128, 242],
  [136, 224],
  [146, 206],
  [158, 190],
  [172, 176],
  [182, 164],
  [186, 154],
  [180, 146],
  [172, 140],
  [182, 132],
  [192, 120],
  [180, 108],
  [168, 96],
  [158, 82],
  [150, 66],
  [144, 50],
  [134, 36],
  [118, 24],
  [100, 18],
  [80, 20],
  [62, 30],
  [46, 46],
  [34, 66],
  [26, 88],
  [22, 112],
  [24, 136],
  [32, 156],
  [44, 174],
  [54, 190],
  [62, 208],
  [66, 226],
  [64, 242],
];

function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pointInPoly(poly, x, y) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const crosses = (yi > y) !== (yj > y);
    if (crosses && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function resampleClosed(poly, spacing) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const steps = Math.max(1, Math.round(Math.hypot(dx, dy) / spacing));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push([a[0] + dx * t, a[1] + dy * t]);
    }
  }
  return out;
}

function tooClose(points, x, y, minDist) {
  const minSq = minDist * minDist;
  for (let i = 0; i < points.length; i++) {
    const dx = points[i].x - x;
    const dy = points[i].y - y;
    if (dx * dx + dy * dy < minSq) return true;
  }
  return false;
}

/** Positive when p is inside the circumcircle of triangle a-b-c. */
function inCircumcircle(p, a, b, c) {
  const ax = a.x - p.x;
  const ay = a.y - p.y;
  const bx = b.x - p.x;
  const by = b.y - p.y;
  const cx = c.x - p.x;
  const cy = c.y - p.y;
  const det =
    (ax * ax + ay * ay) * (bx * cy - cx * by) -
    (bx * bx + by * by) * (ax * cy - cx * ay) +
    (cx * cx + cy * cy) * (ax * by - bx * ay);
  const orient = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  if (orient === 0) return false;
  return orient > 0 ? det > 0 : det < 0;
}

function delaunay(points) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const delta = Math.max(maxX - minX, maxY - minY) * 10;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const verts = points.slice();
  const superStart = verts.length;
  verts.push(
    { x: midX - delta * 2, y: midY - delta },
    { x: midX, y: midY + delta * 2 },
    { x: midX + delta * 2, y: midY - delta },
  );

  const tris = [[superStart, superStart + 1, superStart + 2]];

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const bad = [];
    for (let t = 0; t < tris.length; t++) {
      const [a, b, c] = tris[t];
      if (inCircumcircle(p, verts[a], verts[b], verts[c])) bad.push(t);
    }

    const edgeCount = new Map();
    for (let k = 0; k < bad.length; k++) {
      const [a, b, c] = tris[bad[k]];
      countEdge(edgeCount, a, b);
      countEdge(edgeCount, b, c);
      countEdge(edgeCount, c, a);
    }
    for (let k = bad.length - 1; k >= 0; k--) tris.splice(bad[k], 1);

    edgeCount.forEach((count, key) => {
      if (count !== 1) return;
      const split = key.split(',');
      tris.push([Number(split[0]), Number(split[1]), i]);
    });
  }

  return tris.filter(
    (tri) => tri[0] < superStart && tri[1] < superStart && tri[2] < superStart,
  );
}

function countEdge(map, i, j) {
  const key = i < j ? `${i},${j}` : `${j},${i}`;
  map.set(key, (map.get(key) || 0) + 1);
}

/**
 * Dots and triangle edges for the splash head.
 * Built once from a fixed seed, then memoized so the mesh never changes.
 */
function buildHeadMesh(seed) {
  const rand = mulberry32(seed);
  const points = resampleClosed(SILHOUETTE, 14).map(([x, y]) => ({ x, y }));
  const regions = [
    { x0: 22, x1: 190, y0: 18, y1: 242, step: 16 },
    { x0: 120, x1: 190, y0: 55, y1: 190, step: 10 },
    { x0: 50, x1: 160, y0: 180, y1: 240, step: 10 },
  ];

  for (let r = 0; r < regions.length; r++) {
    const region = regions[r];
    for (let y = region.y0; y <= region.y1; y += region.step) {
      for (let x = region.x0; x <= region.x1; x += region.step) {
        const jx = x + (rand() - 0.5) * region.step * 0.7;
        const jy = y + (rand() - 0.5) * region.step * 0.7;
        if (!pointInPoly(SILHOUETTE, jx, jy)) continue;
        if (tooClose(points, jx, jy, 7.5)) continue;
        points.push({ x: jx, y: jy });
      }
    }
  }

  const triangles = delaunay(points);
  const edges = [];
  const seen = new Set();
  for (let t = 0; t < triangles.length; t++) {
    const [a, b, c] = triangles[t];
    const cx = (points[a].x + points[b].x + points[c].x) / 3;
    const cy = (points[a].y + points[b].y + points[c].y) / 3;
    if (!pointInPoly(SILHOUETTE, cx, cy)) continue;
    const pairs = [
      [a, b],
      [b, c],
      [c, a],
    ];
    for (let e = 0; e < pairs.length; e++) {
      const i = pairs[e][0];
      const j = pairs[e][1];
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([i, j]);
    }
  }

  return {
    nodes: points.map((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]),
    edges,
  };
}

/**
 * The generated profile is too tall for the phone frame (about 0.78 wide
 * per unit of height). Stretch it sideways so the head is about as wide
 * as it is tall, matching the Figma frame.
 */
function widenHead(mesh) {
  const scaleX = 1.28;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < mesh.nodes.length; i++) {
    const x = mesh.nodes[i][0];
    const y = mesh.nodes[i][1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const midX = (minX + maxX) / 2;
  const stretched = mesh.nodes.map(([x, y]) => [midX + (x - midX) * scaleX, y]);
  minX = Infinity;
  maxX = -Infinity;
  minY = Infinity;
  maxY = -Infinity;
  for (let i = 0; i < stretched.length; i++) {
    const x = stretched[i][0];
    const y = stretched[i][1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const pad = 8;
  const viewW = maxX - minX + pad * 2;
  const viewH = maxY - minY + pad * 2;
  return {
    nodes: stretched.map(([x, y]) => [
      Math.round((x - minX + pad) * 10) / 10,
      Math.round((y - minY + pad) * 10) / 10,
    ]),
    edges: mesh.edges,
    viewW,
    viewH,
    glow: {
      cx: (maxX - minX) * 0.74 + pad,
      cy: (maxY - minY) * 0.42 + pad,
      rx: viewW * 0.28,
      ry: viewH * 0.3,
    },
  };
}

const HEAD = widenHead(buildHeadMesh(0x51a9c0de));

function WireframeHead({ width, height }) {
  const { nodes, edges, viewW, viewH, glow } = useMemo(() => HEAD, []);
  if (width <= 0 || height <= 0) return null;

  const scale = width / viewW;
  const dotR = 1.5 / scale;
  const strokeW = 0.6 / scale;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${viewW} ${viewH}`}>
      <Defs>
        <RadialGradient id="splashFaceGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#6D5BFF" stopOpacity="0.45" />
          <Stop offset="55%" stopColor="#6D5BFF" stopOpacity="0.16" />
          <Stop offset="100%" stopColor="#6D5BFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={glow.cx} cy={glow.cy} rx={glow.rx} ry={glow.ry} fill="url(#splashFaceGlow)" />
      {edges.map(([from, to]) => (
        <Line
          key={`${from}-${to}`}
          x1={nodes[from][0]}
          y1={nodes[from][1]}
          x2={nodes[to][0]}
          y2={nodes[to][1]}
          stroke="#FFFFFF"
          strokeOpacity={0.35}
          strokeWidth={strokeW}
        />
      ))}
      {nodes.map(([x, y], index) => (
        <Circle key={index} cx={x} cy={y} r={dotR} fill="#FFFFFF" fillOpacity={0.8} />
      ))}
    </Svg>
  );
}

/** Opening screen. Calls onFinish after 2 seconds. */
export default function SplashScreen({ onFinish }) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const columnW = Math.min(screenW, 420);
  let headW = columnW * 0.65;
  let headH = headW * (HEAD.viewH / HEAD.viewW);
  const headTop = screenH * 0.13;
  const titleTop = screenH * 0.58;
  if (headTop + headH > titleTop) {
    headH = titleTop - headTop;
    headW = headH * (HEAD.viewW / HEAD.viewH);
  }
  const [trackWidth, setTrackWidth] = useState(headW);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish, progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth],
  });

  const creditBottom = Math.max(screenH * 0.06, insets.bottom + 4);

  return (
    <LinearGradient
      colors={['#0B1430', '#0F1A35']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.screen}
    >
      <View style={styles.column}>
        <View
          style={[
            styles.headSlot,
            {
              top: headTop,
              width: headW,
              height: headH,
              left: (columnW - headW) / 2,
            },
          ]}
        >
          <WireframeHead width={headW} height={headH} />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{'DeepFake\nDetector AI'}</Text>
          <Text style={styles.subtitle}>{'Check if a video is real, using\nthe pulse and lip-sync'}</Text>
        </View>

        <View
          style={[styles.track, { width: headW, left: (columnW - headW) / 2 }]}
          onLayout={(event) => {
            const next = event.nativeEvent.layout.width;
            setTrackWidth((prev) => (prev === next ? prev : next));
          }}
        >
          <Animated.View style={[styles.fillClip, { width: fillWidth }]}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: trackWidth, height: 4 }}
            />
          </Animated.View>
        </View>

        <Text style={styles.ready}>Getting things ready...</Text>
        <Text style={[styles.credit, { bottom: creditBottom }]}>by Kashish & Samapati</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    height: '100%',
    alignSelf: 'center',
    position: 'relative',
  },
  headSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    position: 'absolute',
    top: '60%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  track: {
    position: 'absolute',
    top: '87%',
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  fillClip: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  ready: {
    position: 'absolute',
    top: '90%',
    left: 0,
    right: 0,
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  credit: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
