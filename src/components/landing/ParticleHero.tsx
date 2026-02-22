"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

// ─── Stealth fighter jet — wireframe line segments with swirling flow ───

type Vec2 = readonly [number, number]

function lerp2(a: Vec2, b: Vec2, t: number): [number, number] {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

function sampleLine(a: Vec2, b: Vec2, count: number): { pos: [number, number], tangent: [number, number] }[] {
    const dx = b[0] - a[0], dy = b[1] - a[1]
    const len = Math.sqrt(dx * dx + dy * dy)
    const tx = dx / (len || 1), ty = dy / (len || 1)
    const pts: { pos: [number, number], tangent: [number, number] }[] = []
    for (let i = 0; i <= count; i++) {
        const t = i / count
        const p = lerp2(a, b, t)
        p[0] += (Math.random() - 0.5) * 0.008
        p[1] += (Math.random() - 0.5) * 0.008
        pts.push({ pos: p, tangent: [tx, ty] })
    }
    return pts
}

// Key vertices — top-down view, nose pointing RIGHT (+x)
const V = {
    nose: [1.0, 0.0] as Vec2,
    fwdR: [0.65, 0.05] as Vec2,
    fwdL: [0.65, -0.05] as Vec2,
    canFR: [0.45, 0.06] as Vec2,
    canFL: [0.45, -0.06] as Vec2,
    canBR: [0.3, 0.07] as Vec2,
    canBL: [0.3, -0.07] as Vec2,
    wRootLER: [0.15, 0.08] as Vec2,
    wRootLEL: [0.15, -0.08] as Vec2,
    wTipR: [-0.35, 0.72] as Vec2,
    wTipL: [-0.35, -0.72] as Vec2,
    wTipTER: [-0.45, 0.65] as Vec2,
    wTipTEL: [-0.45, -0.65] as Vec2,
    wRootTER: [-0.55, 0.12] as Vec2,
    wRootTEL: [-0.55, -0.12] as Vec2,
    tailBaseR: [-0.7, 0.10] as Vec2,
    tailBaseL: [-0.7, -0.10] as Vec2,
    hstabR: [-0.85, 0.30] as Vec2,
    hstabL: [-0.85, -0.30] as Vec2,
    hstabTER: [-0.92, 0.22] as Vec2,
    hstabTEL: [-0.92, -0.22] as Vec2,
    exhR: [-1.0, 0.06] as Vec2,
    exhL: [-1.0, -0.06] as Vec2,
    tailTip: [-1.05, 0.0] as Vec2,
}

function generateAircraftData(count: number) {
    const all: { pos: [number, number], tangent: [number, number] }[] = []

    // Leading edges
    all.push(...sampleLine(V.nose, V.fwdR, 10))
    all.push(...sampleLine(V.fwdR, V.canFR, 6))
    all.push(...sampleLine(V.canFR, V.canBR, 5))
    all.push(...sampleLine(V.canBR, V.wRootLER, 5))
    all.push(...sampleLine(V.wRootLER, V.wTipR, 22))
    all.push(...sampleLine(V.nose, V.fwdL, 10))
    all.push(...sampleLine(V.fwdL, V.canFL, 6))
    all.push(...sampleLine(V.canFL, V.canBL, 5))
    all.push(...sampleLine(V.canBL, V.wRootLEL, 5))
    all.push(...sampleLine(V.wRootLEL, V.wTipL, 22))

    // Trailing edges
    all.push(...sampleLine(V.wTipR, V.wTipTER, 5))
    all.push(...sampleLine(V.wTipTER, V.wRootTER, 15))
    all.push(...sampleLine(V.wRootTER, V.tailBaseR, 6))
    all.push(...sampleLine(V.wTipL, V.wTipTEL, 5))
    all.push(...sampleLine(V.wTipTEL, V.wRootTEL, 15))
    all.push(...sampleLine(V.wRootTEL, V.tailBaseL, 6))

    // Tail fins
    all.push(...sampleLine(V.tailBaseR, V.hstabR, 8))
    all.push(...sampleLine(V.hstabR, V.hstabTER, 5))
    all.push(...sampleLine(V.hstabTER, V.exhR, 5))
    all.push(...sampleLine(V.exhR, V.tailTip, 3))
    all.push(...sampleLine(V.tailBaseL, V.hstabL, 8))
    all.push(...sampleLine(V.hstabL, V.hstabTEL, 5))
    all.push(...sampleLine(V.hstabTEL, V.exhL, 5))
    all.push(...sampleLine(V.exhL, V.tailTip, 3))

    // Fuselage spine
    all.push(...sampleLine(V.nose, V.tailTip, 30))

    // Wing spars
    all.push(...sampleLine(V.canBR, V.wTipTER, 12))
    all.push(...sampleLine(V.canBL, V.wTipTEL, 12))
    all.push(...sampleLine([0.0, 0.08] as Vec2, [-0.4, 0.45] as Vec2, 10))
    all.push(...sampleLine([0.0, -0.08] as Vec2, [-0.4, -0.45] as Vec2, 10))

    // Engine nacelles
    all.push(...sampleLine([-0.5, 0.08] as Vec2, [-0.95, 0.06] as Vec2, 10))
    all.push(...sampleLine([-0.5, -0.08] as Vec2, [-0.95, -0.06] as Vec2, 10))

    const SCALE = 11.0
    const positions = new Float32Array(count * 3)
    const tangents = new Float32Array(count * 2)

    for (let i = 0; i < count; i++) {
        const d = all[i % all.length]
        positions[i * 3] = d.pos[0] * SCALE
        positions[i * 3 + 1] = d.pos[1] * SCALE
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2
        tangents[i * 2] = d.tangent[0]
        tangents[i * 2 + 1] = d.tangent[1]
    }
    return { positions, tangents }
}

const PARTICLE_COUNT = 1000

const PALETTE = [
    "#4285F4", "#1a73e8",  // Google Blue
    "#EA4335", "#D93025",  // Google Red
    "#FBBC04", "#F9AB00",  // Google Yellow
    "#34A853", "#0F9D58",  // Google Green
    "#7B68EE", "#A78BFA",  // Purple accents
    "#FF6D01", "#E8710A",  // Orange
]

// uAngle = smoothed angle from center toward mouse (radians)
// The aircraft rotates to always point its nose toward the mouse
const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uAngle;     // rotation angle toward mouse
uniform float uIdleMorph; // 0 = fully formed, 1 = fully dissolved

attribute vec3 aTarget;
attribute vec3 aScatter;
attribute vec2 aTangent;
attribute vec3 aRandomizer;
attribute vec3 aColor;
attribute float aSize;

varying vec3 vColor;
varying float vAlpha;
varying float vTangentAngle; // angle for dash orientation

// 2D rotation matrix
vec2 rotate2D(vec2 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
    vColor = aColor;

    // ── Formation morph (initial entry) ──
    float formStart = 1.2;
    float formDuration = 2.0;
    float entryMorph = clamp((uTime - formStart) / formDuration, 0.0, 1.0);
    entryMorph = 1.0 - pow(1.0 - entryMorph, 3.0);

    // ── Idle dissolve/reform cycle ──
    // uIdleMorph: 0 = formed, 1 = dissolved
    float morph = entryMorph * (1.0 - uIdleMorph);

    vec3 pos = mix(aScatter, aTarget, morph);

    // ════════════════════════════════════
    // ── ROTATION: nose points toward mouse ──
    // ════════════════════════════════════
    // Rotate the formed aircraft shape around the Z axis
    pos.xy = rotate2D(pos.xy, uAngle * morph);

    // Also rotate the tangent for correct swirl direction
    vec2 rotTangent = rotate2D(aTangent, uAngle * morph);

    // ── Translate so NOSE TIP follows the mouse cursor ──
    // The nose is at local (11, 0), after rotation it's at (11*cos(a), 11*sin(a))
    // Offset the center so the nose lands on the mouse world position
    float noseLen = 11.0;
    float angle = uAngle * morph;
    vec2 mouseWorld = vec2(uMouse.x * 14.0, uMouse.y * 10.0);
    vec2 noseOffset = vec2(noseLen * cos(angle), noseLen * sin(angle));
    vec2 centerPos = mouseWorld - noseOffset;
    float followStrength = morph;
    pos.x += centerPos.x * followStrength;
    pos.y += centerPos.y * followStrength;

    // ══════════════════════════════
    // ── SWIRLING EFFECTS ──
    // ══════════════════════════════

    // 1. Flow along edge tangent
    float flowSpeed = 1.2 + aRandomizer.x * 1.5;
    float flowOffset = sin(uTime * flowSpeed + aRandomizer.y * 6.28) * 0.35;
    pos.x += rotTangent.x * flowOffset * morph;
    pos.y += rotTangent.y * flowOffset * morph;

    // 2. Orbital swirl perpendicular to edge
    float orbitRadius = 0.12 + aRandomizer.z * 0.18;
    float orbitSpeed = 2.5 + aRandomizer.x * 2.0;
    float orbitAngle = uTime * orbitSpeed + aRandomizer.y * 6.28;
    float perpX = -rotTangent.y;
    float perpY =  rotTangent.x;
    pos.x += perpX * sin(orbitAngle) * orbitRadius * morph;
    pos.y += perpY * sin(orbitAngle) * orbitRadius * morph;
    pos.z += cos(orbitAngle) * orbitRadius * 0.5 * morph;

    // 3. Breathing pulse (expand/contract around aircraft center)
    float breathe = 1.0 + sin(uTime * 0.8) * 0.015 * morph;
    vec2 breatheCenter = centerPos * followStrength;
    pos.xy = breatheCenter + (pos.xy - breatheCenter) * breathe;

    // 4. Energy shimmer
    pos.x += sin(uTime * 6.0 + aRandomizer.z * 30.0) * 0.03 * morph;
    pos.y += cos(uTime * 5.5 + aRandomizer.x * 25.0) * 0.025 * morph;

    // ── Pre-formation circular swirl ──
    float preMorph = 1.0 - morph;
    float preAngle = uTime * 2.0 + aRandomizer.z * 6.28;
    float preRadius = 1.5 + aRandomizer.x * 2.0;
    pos.x += cos(preAngle) * preRadius * preMorph;
    pos.y += sin(preAngle) * preRadius * preMorph;
    pos.z += sin(uTime * 3.0 + aRandomizer.y * 6.28) * 0.5 * preMorph;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    gl_PointSize = aSize * (200.0 / -mvPos.z);

    float fadeIn = smoothstep(0.0, 0.8, uTime / 1.0);
    vAlpha = fadeIn * 1.0;

    // Pass tangent angle to fragment shader for dash orientation
    vTangentAngle = atan(rotTangent.y, rotTangent.x) + aRandomizer.z * 0.3;
}
`

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;
varying float vTangentAngle;

void main() {
    vec2 coord = gl_PointCoord - 0.5;

    // Rotate coordinate space by tangent angle to orient the dash
    float ca = cos(-vTangentAngle);
    float sa = sin(-vTangentAngle);
    vec2 rotCoord = vec2(
        coord.x * ca - coord.y * sa,
        coord.x * sa + coord.y * ca
    );

    // Dash shape: elongated capsule (wide on X, narrow on Y)
    float dx = abs(rotCoord.x);
    float dy = abs(rotCoord.y);

    // Capsule: stretch along X, tight on Y
    float capsuleX = max(dx - 0.2, 0.0);  // flat center region
    float dist = length(vec2(capsuleX, dy));

    if (dist > 0.15) discard;

    // Soft edge with bright core
    float alpha = 1.0 - smoothstep(0.06, 0.15, dist);

    // Brighter leading edge (slight gradient along dash)
    float leadGlow = 1.0 + rotCoord.x * 0.5;

    gl_FragColor = vec4(vColor * leadGlow, vAlpha * alpha);
}
`

function StealthJet() {
    const pointsRef = useRef<THREE.Points>(null)
    const mouseRef = useRef({ x: 0, y: 0 })
    const smoothAngleRef = useRef(0)

    const lastMousePos = useRef({ x: 0, y: 0 })
    const lastMoveTime = useRef(0)
    const idleMorphRef = useRef(0)

    const material = useMemo(() => new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uAngle: { value: 0 },
            uIdleMorph: { value: 0 },
        },
    }), [])

    const geometry = useMemo(() => {
        const { positions: targets, tangents } = generateAircraftData(PARTICLE_COUNT)
        const scatter = new Float32Array(PARTICLE_COUNT * 3)
        const colors = new Float32Array(PARTICLE_COUNT * 3)
        const randomizers = new Float32Array(PARTICLE_COUNT * 3)
        const sizes = new Float32Array(PARTICLE_COUNT)

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * 2.0
            scatter[i * 3] = Math.cos(angle) * radius
            scatter[i * 3 + 1] = Math.sin(angle) * radius
            scatter[i * 3 + 2] = (Math.random() - 0.5) * 1.0

            randomizers[i * 3] = Math.random()
            randomizers[i * 3 + 1] = Math.random()
            randomizers[i * 3 + 2] = Math.random()

            sizes[i] = 3.5 + Math.random() * 3.0

            const hex = PALETTE[Math.floor(Math.random() * PALETTE.length)]
            const color = new THREE.Color(hex)
            const brightness = 1.1 + Math.random() * 0.3
            colors[i * 3] = Math.min(1, color.r * brightness)
            colors[i * 3 + 1] = Math.min(1, color.g * brightness)
            colors[i * 3 + 2] = Math.min(1, color.b * brightness)
        }

        const geo = new THREE.BufferGeometry()
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3))
        geo.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3))
        geo.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3))
        geo.setAttribute("aTangent", new THREE.BufferAttribute(tangents, 2))
        geo.setAttribute("aRandomizer", new THREE.BufferAttribute(randomizers, 3))
        geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3))
        geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1))
        return geo
    }, [])

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
            mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
        }
        window.addEventListener("mousemove", onMove)
        return () => window.removeEventListener("mousemove", onMove)
    }, [])

    useFrame((state) => {
        const elapsed = state.clock.elapsedTime
        material.uniforms.uTime.value = elapsed

        // Smooth mouse position
        material.uniforms.uMouse.value.x +=
            (mouseRef.current.x - material.uniforms.uMouse.value.x) * 0.18
        material.uniforms.uMouse.value.y +=
            (mouseRef.current.y - material.uniforms.uMouse.value.y) * 0.18

        // Detect mouse movement
        const dx = mouseRef.current.x - lastMousePos.current.x
        const dy = mouseRef.current.y - lastMousePos.current.y
        if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
            lastMoveTime.current = elapsed
        }
        lastMousePos.current.x = mouseRef.current.x
        lastMousePos.current.y = mouseRef.current.y

        // ── Idle dissolve/reform cycle ──
        // After 2s idle: cycle dissolve (0→1) and reform (1→0) over ~4s total
        const idleDuration = elapsed - lastMoveTime.current
        const idleThreshold = 2.0
        let targetIdleMorph = 0
        if (idleDuration > idleThreshold) {
            const cycleTime = idleDuration - idleThreshold
            const cyclePeriod = 4.0  // full dissolve+reform in 4s
            // Sinusoidal: 0 → 1 → 0 → 1 ... 
            targetIdleMorph = (Math.sin(cycleTime * Math.PI * 2 / cyclePeriod - Math.PI / 2) + 1) / 2
        }
        // Smooth transition — fast reform on mouse move, gradual dissolve
        const lerpSpeed = targetIdleMorph < idleMorphRef.current ? 0.3 : 0.05
        idleMorphRef.current += (targetIdleMorph - idleMorphRef.current) * lerpSpeed
        material.uniforms.uIdleMorph.value = idleMorphRef.current

        // Calculate angle from center to mouse position
        const mx = material.uniforms.uMouse.value.x
        const my = material.uniforms.uMouse.value.y
        const targetAngle = Math.atan2(my, mx)

        // Smooth angle interpolation with wrapping
        let angleDiff = targetAngle - smoothAngleRef.current
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
        smoothAngleRef.current += angleDiff * 0.08

        material.uniforms.uAngle.value = smoothAngleRef.current
    })

    return <points ref={pointsRef} geometry={geometry} material={material} />
}

export function ParticleHero() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <Canvas
                camera={{ position: [0, 0, 22], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: "transparent" }}
            >
                <StealthJet />
            </Canvas>
        </div>
    )
}
