import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Spring1, Spring3 } from './spring'
import { palette } from './materials'
import { StudioLights } from './StudioLights'

type SceneProps = { animate: boolean; hovered: boolean }

/** Tilts the diorama toward the pointer while the card is hovered, then springs back. */
function TiltRig({ animate, hovered, children, base = [0, 0, 0] }: SceneProps & { children: ReactNode; base?: [number, number, number] }) {
  const g = useRef<THREE.Group>(null)
  const s = useMemo(() => new Spring3(45, 7), [])
  useFrame((state, dt) => {
    if (!g.current || !animate) return
    s.target.set(hovered ? state.pointer.y * -0.18 : 0, hovered ? state.pointer.x * 0.45 : 0, 0)
    s.step(dt)
    g.current.rotation.set(base[0] + s.pos.x, base[1] + s.pos.y, base[2])
  })
  return (
    <group ref={g} rotation={base}>
      {children}
    </group>
  )
}

/* ---------------- Agri-Yield Pro: low-poly farmland ---------------- */

const SIZE = 5
const SEG = 20
const CELL = SIZE / SEG

const height = (x: number, z: number) => {
  const hills = Math.sin(x * 1.1) * Math.cos(z * 0.9) * 0.22 + Math.sin(x * 2.3 + z * 1.6) * 0.05
  const ridge = Math.max(0, -z - 1.2) * 0.45 // gentle hills along the back edge
  const fields = Math.max(0, 1 - Math.hypot(x + 0.2, z - 0.2) / 1.7) // flatter farmland in the middle
  return (hills + ridge) * (1 - fields * 0.9)
}

function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG).toNonIndexed()
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) p.setY(i, height(p.getX(i), p.getZ(i)))
    const colors = new Float32Array(p.count * 3)
    const soil = new THREE.Color(palette.soil)
    const green = new THREE.Color(palette.green)
    const dark = new THREE.Color(palette.greenDark)
    const cream = new THREE.Color('#e6dfcc')
    const c = new THREE.Color()
    for (let f = 0; f < p.count; f += 3) {
      // Colour by grid cell (not by triangle) so crop rows come out as clean stripes.
      const cx = (p.getX(f) + p.getX(f + 1) + p.getX(f + 2)) / 3
      const cz = (p.getZ(f) + p.getZ(f + 1) + p.getZ(f + 2)) / 3
      const col = Math.floor((cx + SIZE / 2) / CELL)
      const row = Math.floor((cz + SIZE / 2) / CELL)
      const mx = -SIZE / 2 + (col + 0.5) * CELL
      const mz = -SIZE / 2 + (row + 0.5) * CELL
      const h = height(mx, mz)
      const inField = Math.abs(mx + 0.2) < 1.3 && Math.abs(mz - 0.2) < 1.0
      if (h > 0.55) c.copy(cream)
      else if (inField) c.copy(row % 2 ? green : soil) // striped crop rows
      else c.copy(dark).lerp(green, Math.min(1, Math.max(0, h * 2 + 0.35)))
      for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (f + k) * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.56, 0]}>
        <boxGeometry args={[SIZE, 0.5, SIZE]} />
        <meshStandardMaterial color="#4a3b2e" roughness={1} />
      </mesh>
    </group>
  )
}

function Tree({ x, z, s, delay, animate, wave }: { x: number; z: number; s: number; delay: number; animate: boolean; wave: number }) {
  const g = useRef<THREE.Group>(null)
  const pop = useMemo(() => new Spring1(160, 7, 1), [])
  const t = useRef<number | null>(null)
  useEffect(() => {
    if (wave) t.current = delay // stagger a little hop across the trees on hover
  }, [wave, delay])
  useFrame((_, dt) => {
    if (!g.current || !animate) return
    if (t.current !== null) {
      t.current -= dt
      if (t.current <= 0) {
        pop.kick(4)
        t.current = null
      }
    }
    pop.step(dt)
    g.current.scale.set(s, s * Math.max(0.5, pop.value), s)
  })
  return (
    <group
      ref={g}
      position={[x, height(x, z), z]}
      scale={s}
      onClick={(e) => {
        e.stopPropagation()
        pop.kick(6)
      }}
    >
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.24, 6]} />
        <meshStandardMaterial color={palette.soil} roughness={1} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <coneGeometry args={[0.2, 0.5, 6]} />
        <meshStandardMaterial color={palette.greenDark} flatShading roughness={0.9} />
      </mesh>
    </group>
  )
}

const TREES = [
  [-1.9, -1.8, 1], [-1.4, -2.1, 0.8], [-2.1, -0.9, 0.9], [1.7, -1.7, 1.1], [2.0, -1.0, 0.85],
  [-1.9, 1.7, 0.95], [1.5, 1.9, 0.8], [2.0, 1.3, 1],
] as const

function AgriScene({ animate, hovered }: SceneProps) {
  const [wave, setWave] = useState(0)
  useEffect(() => {
    if (hovered) setWave((w) => w + 1)
  }, [hovered])
  return (
    <TiltRig animate={animate} hovered={hovered} base={[0, -0.5, 0]}>
      <Terrain />
      {TREES.map(([x, z, s], i) => (
        <Tree key={i} x={x} z={z} s={s} delay={i * 0.06} animate={animate} wave={wave} />
      ))}
      {/* Farmhouse */}
      <group position={[1.5, height(1.5, -0.3), -0.3]}>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.4, 0.32, 0.3]} />
          <meshStandardMaterial color="#ece6d8" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.42, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.32, 0.22, 4]} />
          <meshStandardMaterial color={palette.soil} flatShading />
        </mesh>
      </group>
    </TiltRig>
  )
}

/* ---------------- SITTO: miniature campus ---------------- */

const BUILDINGS: { x: number; z: number; w: number; d: number; h: number; tone: 'ivory' | 'graphite' | 'amber' }[] = [
  { x: -1.6, z: -1.3, w: 1.1, d: 0.7, h: 0.55, tone: 'amber' }, // the library — the one accent
  { x: -0.2, z: -1.5, w: 0.7, d: 0.7, h: 1.1, tone: 'ivory' },
  { x: 1.2, z: -1.2, w: 1.0, d: 0.9, h: 0.75, tone: 'graphite' },
  { x: -1.7, z: 0.4, w: 0.8, d: 1.1, h: 0.85, tone: 'ivory' },
  { x: 0.1, z: 0.2, w: 1.2, d: 0.6, h: 0.45, tone: 'ivory' },
  { x: 1.5, z: 0.5, w: 0.6, d: 0.6, h: 1.35, tone: 'ivory' },
  { x: -0.6, z: 1.6, w: 0.9, d: 0.6, h: 0.6, tone: 'graphite' },
  { x: 1.1, z: 1.7, w: 1.0, d: 0.6, h: 0.5, tone: 'ivory' },
]
const toneColor = { ivory: palette.ivory, graphite: '#2c2c29', amber: palette.amber }

function Building({ b, animate, index }: { b: (typeof BUILDINGS)[number]; animate: boolean; index: number }) {
  const g = useRef<THREE.Group>(null)
  const lift = useMemo(() => new Spring1(110, 8, 0), [])
  const [over, setOver] = useState(false)
  useFrame((_, dt) => {
    if (!g.current) return
    if (animate) {
      lift.target = over ? 0.22 : 0
      lift.step(dt)
    }
    g.current.position.y = lift.value
  })
  return (
    <group
      ref={g}
      position={[b.x, 0, b.z]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setOver(true)
      }}
      onPointerOut={() => setOver(false)}
      onClick={(e) => {
        e.stopPropagation()
        if (animate) lift.kick(3.5)
      }}
    >
      <RoundedBox args={[b.w, b.h, b.d]} radius={0.05} smoothness={3} position={[0, b.h / 2 + 0.06, 0]}>
        <meshStandardMaterial color={toneColor[b.tone]} roughness={0.6} emissive={b.tone === 'amber' && over ? palette.amber : '#000000'} emissiveIntensity={0.25} />
      </RoundedBox>
      {/* window band */}
      <mesh position={[0, b.h * 0.6 + 0.06, b.d / 2 + 0.002]}>
        <planeGeometry args={[b.w * 0.75, 0.05]} />
        <meshBasicMaterial color={index % 3 ? '#11110f' : palette.stone} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

function SittoScene({ animate, hovered }: SceneProps) {
  return (
    <TiltRig animate={animate} hovered={hovered} base={[0, 0.6, 0]}>
      <RoundedBox args={[5.4, 0.12, 5]} radius={0.05} smoothness={3}>
        <meshStandardMaterial color="#1b1b19" roughness={0.9} />
      </RoundedBox>
      <gridHelper args={[5, 20, '#3a3934', '#262622']} position={[0, 0.065, 0]} />
      {/* Map-like paths */}
      {[
        [0, -0.55, 5, 0.06],
        [0, 1.05, 5, 0.06],
        [-0.95, 0.25, 0.06, 4.6],
        [0.7, 0.25, 0.06, 4.6],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.07, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshBasicMaterial color={palette.stone} transparent opacity={0.5} />
        </mesh>
      ))}
      {BUILDINGS.map((b, i) => (
        <Building key={i} b={b} index={i} animate={animate} />
      ))}
      {[[-2.4, 1.9], [2.3, -2.1], [-0.2, -0.55], [2.4, 1.1]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.24, z]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color={palette.green} roughness={0.8} flatShading />
        </mesh>
      ))}
    </TiltRig>
  )
}

/** Re-render once when the scene pauses or resumes (frameloop "demand"). */
function Invalidate({ active, reduced }: { active: boolean; reduced: boolean }) {
  const { invalidate } = useThree()
  useEffect(() => {
    invalidate()
  }, [invalidate, active, reduced])
  return null
}

export default function ProjectScene({ slug, active, reduced, hovered }: { slug: string; active: boolean; reduced: boolean; hovered: boolean }) {
  const animate = active && !reduced
  const agri = slug === 'agri-yield-pro'
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: agri ? [6.4, 5.6, 7.6] : [6.2, 6.6, 7.4], fov: 32 }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      frameloop={animate ? 'always' : 'demand'}
      data-interactive
    >
      <StudioLights intensity={0.9} />
      <Invalidate active={active} reduced={reduced} />
      {agri ? <AgriScene animate={animate} hovered={hovered} /> : <SittoScene animate={animate} hovered={hovered} />}
    </Canvas>
  )
}
