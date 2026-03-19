import {
    BlurMask,
    Canvas,
    Circle,
    Group,
    Path,
    Skia,
    SkPath,
} from '@shopify/react-native-skia';
import React, { useEffect, useMemo, useRef } from 'react';
import {
    Easing,
    SharedValue,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Types & Math Helpers
// ---------------------------------------------------------------------------

type Vec3 = [number, number, number];
type Vec2 = [number, number];
const DEG = Math.PI / 180;

function rotX(v: Vec3, a: number): Vec3 { 'worklet'; const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; }
function rotY(v: Vec3, a: number): Vec3 { 'worklet'; const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; }
function rotZ(v: Vec3, a: number): Vec3 { 'worklet'; const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; }
function rotate(v: Vec3, rx: number, ry: number, rz: number): Vec3 { 'worklet'; return rotZ(rotY(rotX(v, rx), ry), rz); }

const PERSP_D = 4.5; 
function project(v: Vec3, cx: number, cy: number, sz: number): Vec2 { 'worklet'; const f = PERSP_D / (PERSP_D + v[2]); return [cx + v[0] * f * sz, cy + v[1] * f * sz]; }
function perspScale(v: Vec3): number { 'worklet'; return PERSP_D / (PERSP_D + v[2]); }

// ---------------------------------------------------------------------------
// Cube Geometry
// ---------------------------------------------------------------------------

const H = 1;
const CUBE_VERTS: Vec3[] = [[-H, -H, -H], [H, -H, -H], [H, H, -H], [-H, H, -H], [-H, -H, H], [H, -H, H], [H, H, H], [-H, H, H]];

interface FaceDef { verts: [number, number, number, number]; value: number; normal: Vec3; }
const FACES: FaceDef[] = [
    { verts: [0, 1, 2, 3], value: 1, normal: [0, 0, -1] },
    { verts: [5, 4, 7, 6], value: 6, normal: [0, 0, 1] },
    { verts: [4, 0, 3, 7], value: 2, normal: [-1, 0, 0] },
    { verts: [1, 5, 6, 2], value: 5, normal: [1, 0, 0] },
    { verts: [4, 5, 1, 0], value: 3, normal: [0, -1, 0] },
    { verts: [3, 2, 6, 7], value: 4, normal: [0, 1, 0] },
];

const VALUE_TARGET: Record<number, { x: number; y: number }> = {
    1: { x: 0, y: 0 }, 6: { x: 0, y: 180 }, 2: { x: 0, y: -90 }, 5: { x: 0, y: 90 }, 3: { x: 90, y: 0 }, 4: { x: -90, y: 0 },
};

const C: Vec2 = [0.5, 0.5]; const TL: Vec2 = [0.25, 0.25]; const TR: Vec2 = [0.75, 0.25];
const ML: Vec2 = [0.25, 0.5]; const MR: Vec2 = [0.75, 0.5]; const BL: Vec2 = [0.25, 0.75]; const BR: Vec2 = [0.75, 0.75];

const PIP_LAYOUTS: Record<number, Vec2[]> = {
    1: [C], 2: [TR, BL], 3: [TR, C, BL], 4: [TL, TR, BL, BR], 5: [TL, TR, C, BL, BR], 6: [TL, TR, ML, MR, BL, BR],
};

// ---------------------------------------------------------------------------
// Path Builders
// ---------------------------------------------------------------------------

function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 { 'worklet'; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

function buildRoundedQuadPath(pts: Vec2[], r: number, p: SkPath): SkPath {
    'worklet';
    p.reset();
    const n = pts.length;
    const cr = Math.min(r, 0.4);
    const start = lerpVec2(pts[0], pts[1], cr);
    p.moveTo(start[0], start[1]);
    for (let i = 0; i < n; i++) {
        const curr = pts[i]; const next = pts[(i + 1) % n]; const prev = pts[(i + n - 1) % n];
        const endLine = lerpVec2(curr, next, 1 - cr);
        p.lineTo(endLine[0], endLine[1]);
        const nextPt = pts[(i + 1) % n]; const nextNext = pts[(i + 2) % n];
        const afterCorner = lerpVec2(nextPt, nextNext, cr);
        p.quadTo(nextPt[0], nextPt[1], afterCorner[0], afterCorner[1]);
    }
    p.close();
    return p;
}

function smoothstep(edge0: number, edge1: number, x: number): number { 'worklet'; const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0))); return t * t * (3 - 2 * t); }
function bilinearQuad(pts: Vec2[], u: number, v: number): Vec2 { 'worklet'; const a = lerpVec2(pts[0], pts[1], u); const b = lerpVec2(pts[3], pts[2], u); return lerpVec2(a, b, v); }

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface Face3DRender {
    path: SkPath; fillOpacity: number; brightness: number; depth: number; value: number; pipPositions: Vec2[]; pipRadius: number; pipOpacity: number;
}

function compute3DFaces(rxDeg: number, ryDeg: number, rzDeg: number, canvasSize: number, dieSize: number, facePaths: SkPath[]): Face3DRender[] {
    'worklet';
    const rx = rxDeg * DEG; const ry = ryDeg * DEG; const rz = rzDeg * DEG;
    const cx = canvasSize / 2; const cy = canvasSize / 2; const sz = dieSize / 2;
    const rotated: Vec3[] = CUBE_VERTS.map(v => rotate(v, rx, ry, rz));
    const projected: Vec2[] = rotated.map(v => project(v, cx, cy, sz));
    const results: Face3DRender[] = [];
    for (const face of FACES) {
        const [i0, i1, i2, i3] = face.verts;
        const pts: Vec2[] = [projected[i0], projected[i1], projected[i2], projected[i3]];
        const n = rotate(face.normal, rx, ry, rz);
        const facing = -n[2];
        const opacity = smoothstep(-0.05, 0.35, facing);
        if (opacity < 0.001) continue;
        const brightness = Math.max(0, facing) * 0.15;
        const avgZ = (rotated[i0][2] + rotated[i1][2] + rotated[i2][2] + rotated[i3][2]) / 4;
        const path = buildRoundedQuadPath(pts, 0.28, facePaths[results.length]);
        const pips = PIP_LAYOUTS[face.value] ?? [];
        const avgScale = (perspScale(rotated[i0]) + perspScale(rotated[i1]) + perspScale(rotated[i2]) + perspScale(rotated[i3])) / 4;
        const pipR = (dieSize * 0.055) * avgScale;
        const pipPositions: Vec2[] = pips.map(([u, v]) => bilinearQuad(pts, u, v));
        results.push({ path, fillOpacity: opacity, brightness, depth: avgZ, value: face.value, pipPositions, pipRadius: pipR, pipOpacity: opacity });
    }
    results.sort((a, b) => b.depth - a.depth);
    return results;
}

export const Die3D: React.FC<{
    value: number; rolling: boolean; rollNonce: number; size?: number;
    faceColor?: string; edgeColor?: string; pipColor?: string; highlighted?: boolean;
}> = ({
    value, rolling, rollNonce, size = 150,
    faceColor = '#FFFFFF', edgeColor = '#333333', pipColor = '#111111', highlighted = false
}) => {
    const canvasSize = size;
    const dieSize = size * 0.55;
    const rotXVal = useSharedValue(0);
    const rotYVal = useSharedValue(0);
    const rotZVal = useSharedValue(0);

    const prevRollingRef = useRef(false);
    const prevNonceRef = useRef(rollNonce);
    const prevValueRef = useRef(value);

    useEffect(() => {
        const isNewRollEvent = (rolling && !prevRollingRef.current) || (rolling && rollNonce !== prevNonceRef.current);
        prevRollingRef.current = rolling; prevNonceRef.current = rollNonce; prevValueRef.current = value;

        if (!rolling) {
            const target = VALUE_TARGET[value] ?? VALUE_TARGET[1];
            const timing = { duration: 600, easing: Easing.out(Easing.cubic) };
            rotXVal.value = withTiming(target.x + 360, timing);
            rotYVal.value = withTiming(target.y + 360, timing);
            rotZVal.value = withTiming(360, timing);
            return;
        }

        if (isNewRollEvent) {
            const spinTiming = { duration: 400, easing: Easing.linear };
            rotXVal.value = withRepeat(withTiming(rotXVal.value + 360, spinTiming), -1);
            rotYVal.value = withRepeat(withTiming(rotYVal.value + 720, spinTiming), -1);
            rotZVal.value = withRepeat(withTiming(rotZVal.value + 360, spinTiming), -1);
        }
    }, [rolling, value, rollNonce]);

    const facePaths = useMemo(() => Array.from({ length: 6 }).map(() => Skia.Path.Make()), []);
    const facesData = useDerivedValue(() => compute3DFaces(rotXVal.value, rotYVal.value, rotZVal.value, canvasSize, dieSize, facePaths));

    return (
        <Canvas style={{ width: canvasSize, height: canvasSize }}>
            {highlighted && (
                <Group>
                    <Circle cx={canvasSize / 2} cy={canvasSize / 2} r={dieSize * 0.9} color="#FFD60A" opacity={0.3}>
                        <BlurMask blur={20} style="normal" />
                    </Circle>
                </Group>
            )}
            <Die3DRenderer facesData={facesData} faceColor={faceColor} edgeColor={edgeColor} pipColor={pipColor} strokeWidth={dieSize * 0.03} />
        </Canvas>
    );
};

const Die3DRenderer: React.FC<{ facesData: SharedValue<Face3DRender[]>; faceColor: string; edgeColor: string; pipColor: string; strokeWidth: number; }> = ({ facesData, faceColor, edgeColor, pipColor, strokeWidth }) => {
    return (
        <Group>
            {[0, 1, 2, 3, 4, 5].map(idx => (
                <FaceRenderer key={idx} idx={idx} facesData={facesData} faceColor={faceColor} edgeColor={edgeColor} pipColor={pipColor} strokeWidth={strokeWidth} />
            ))}
        </Group>
    );
};

const FaceRenderer: React.FC<{ idx: number; facesData: SharedValue<Face3DRender[]>; faceColor: string; edgeColor: string; pipColor: string; strokeWidth: number; }> = ({ idx, facesData, faceColor, edgeColor, pipColor, strokeWidth }) => {
    const path = useDerivedValue(() => { const f = facesData.value[idx]; return f ? f.path : Skia.Path.Make(); });
    const opacity = useDerivedValue(() => { const f = facesData.value[idx]; return f ? f.fillOpacity : 0; });
    const brightness = useDerivedValue(() => { const f = facesData.value[idx]; return f ? f.brightness : 0; });
    const overlayColor = useDerivedValue(() => { const b = brightness.value; const alpha = Math.round(b * 255); return `#ffffff${alpha.toString(16).padStart(2, '0')}`; });
    const pipPositions = useDerivedValue(() => { const f = facesData.value[idx]; return f ? f.pipPositions : []; });
    const pipRadius = useDerivedValue(() => { const f = facesData.value[idx]; return f ? f.pipRadius : 0; });

    return (
        <Group opacity={opacity}>
            <Path path={path} color={faceColor} style="fill" />
            <Path path={path} color={overlayColor} style="fill" />
            <Path path={path} color={edgeColor} style="stroke" strokeWidth={strokeWidth} strokeCap="round" strokeJoin="round" />
            {[0, 1, 2, 3, 4, 5].map(pIdx => (
                <PipRenderer key={pIdx} pIdx={pIdx} pipPositions={pipPositions} pipRadius={pipRadius} pipColor={pipColor} />
            ))}
        </Group>
    );
};

const PipRenderer: React.FC<{ pIdx: number; pipPositions: SharedValue<Vec2[]>; pipRadius: SharedValue<number>; pipColor: string; }> = ({ pIdx, pipPositions, pipRadius, pipColor }) => {
    const cx = useDerivedValue(() => { const p = pipPositions.value[pIdx]; return p ? p[0] : 0; });
    const cy = useDerivedValue(() => { const p = pipPositions.value[pIdx]; return p ? p[1] : 0; });
    const opacity = useDerivedValue(() => { return pIdx < pipPositions.value.length ? 1 : 0; });
    return <Circle cx={cx} cy={cy} r={pipRadius} color={pipColor} opacity={opacity} />;
};
