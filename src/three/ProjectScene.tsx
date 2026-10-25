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

/* A season loop: sprouts grow, ripen to gold, get harvested, then the next crop starts. */
const SEASON = 14 // seconds per loop
const CROPS = (() => {
  const out: [number, number][] = []
  for (let row = 0; row < SEG; row++) {
    const mz = -SIZE / 2 + (row + 0.5) * CELL
    if (row % 2 === 0 || Math.abs(mz - 0.2) >= 1.0) continue // only the green crop rows
    for (let mx = -1.4; mx <= 1.0; mx += 0.2) out.push([mx, mz])
  }
  return out
})()

function Crops({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const scl = useMemo(() => new THREE.Vector3(), [])
  const green = useMemo(() => new THREE.Color(palette.lime), [])
  const gold = useMemo(() => new THREE.Color(palette.amber), [])
  const c = useMemo(() => new THREE.Color(), [])
  const t = useRef(SEASON * 0.45) // start mid-growth so the first frame isn't empty

  useFrame((_, dt) => {
    const mesh = ref.current
    if (!mesh) return
    if (animate) t.current = (t.current + dt) % SEASON
    const p = t.current / SEASON
    CROPS.forEach(([x, z], i) => {
      const lag = (i % 7) * 0.012 // small offsets so rows don't move in lockstep
      const grow = THREE.MathUtils.smoothstep(p - lag, 0.02, 0.55) // sprout → full height
      const ripe = THREE.MathUtils.smoothstep(p - lag, 0.6, 0.75) // green → gold
      const cut = 1 - THREE.MathUtils.smoothstep(p - lag * 2, 0.86, 0.94) // harvest
      const s = Math.max(0.001, grow * cut)
      m.compose(pos.set(x, height(x, z) + 0.09 * s, z), q, scl.setScalar(s))
      mesh.setMatrixAt(i, m)
      mesh.setColorAt(i, c.copy(green).lerp(gold, ripe))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, CROPS.length]}>
      <coneGeometry args={[0.07, 0.2, 5]} />
      <meshStandardMaterial flatShading roughness={0.8} />
    </instancedMesh>
  )
}

/** Small tractor that sweeps back and forth along the field edge. */
function Tractor({ animate }: { animate: boolean }) {
  const g = useRef<THREE.Group>(null)
  const t = useRef(0)
  useFrame((_, dt) => {
    if (!g.current) return
    if (animate) t.current += dt
    const u = (Math.sin(t.current * 0.45) + 1) / 2 // 0..1 ping-pong
    const x = -1.45 + u * 2.5
    const z = 1.35
    const dir = Math.cos(t.current * 0.45) >= 0 ? 0 : Math.PI
    g.current.position.set(x, height(x, z) + 0.02, z)
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, dir, 0.08)
    g.current.position.y += Math.abs(Math.sin(t.current * 14)) * 0.008 // engine rumble
  })
  return (
    <group ref={g} scale={0.9}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.28, 0.1, 0.16]} />
        <meshStandardMaterial color={palette.amber} roughness={0.6} />
      </mesh>
      <mesh position={[-0.05, 0.2, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.13]} />
        <meshStandardMaterial color={palette.ivory} roughness={0.5} />
      </mesh>
      {[[-0.08, 0.09], [-0.08, -0.09], [0.1, 0.09], [0.1, -0.09]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.06, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[i < 2 ? 0.07 : 0.045, i < 2 ? 0.07 : 0.045, 0.04, 10]} />
          <meshStandardMaterial color="#1c1c1a" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/** A cloud that drifts across the farm, raining while it's over the fields. */
const DROPS = 40
function RainCloud({ animate }: { animate: boolean }) {
  const g = useRef<THREE.Group>(null)
  const rain = useRef<THREE.InstancedMesh>(null)
  const t = useRef(4)
  const seeds = useMemo(() => Array.from({ length: DROPS }, () => [Math.random() - 0.5, Math.random() - 0.5, Math.random()]), [])
  const m = useMemo(() => new THREE.Matrix4(), [])
  useFrame((_, dt) => {
    if (!g.current || !rain.current) return
    if (animate) t.current = (t.current + dt) % 18
    const x = -3.2 + (t.current / 18) * 6.4
    g.current.position.set(x, 1.75, -0.2 + Math.sin(t.current * 0.4) * 0.3)
    const raining = Math.abs(x) < 1.8 ? 1 : 0
    seeds.forEach(([sx, sz, s], i) => {
      const fall = (s + t.current * 1.6) % 1 // 0 at the cloud, 1 at the ground
      m.makeScale(raining, raining, raining)
      m.setPosition(sx * 1.1, -0.15 - fall * 1.5, sz * 0.7)
      rain.current!.setMatrixAt(i, m)
    })
    rain.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group ref={g}>
      {[[0, 0, 0, 0.32], [0.32, -0.05, 0.05, 0.25], [-0.3, -0.06, -0.03, 0.24], [0.1, 0.12, -0.08, 0.22]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color="#f4f2ec" flatShading roughness={1} />
        </mesh>
      ))}
      <instancedMesh ref={rain} args={[undefined, undefined, DROPS]}>
        <boxGeometry args={[0.012, 0.12, 0.012]} />
        <meshBasicMaterial color="#bcd2e6" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  )
}

function AgriScene({ animate, hovered }: SceneProps) {
  const [wave, setWave] = useState(0)
  useEffect(() => {
    if (hovered) setWave((w) => w + 1)
  }, [hovered])
  return (
    <TiltRig animate={animate} hovered={hovered} base={[0, -0.5, 0]}>
      <Terrain />
      <Crops animate={animate} />
      <Tractor animate={animate} />
      <RainCloud animate={animate} />
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
  // Buildings rise out of the board one after another the first time the scene runs
  const rise = useMemo(() => new Spring1(90, 11, animate ? 0.001 : 1), [])
  const wait = useRef(0.25 + index * 0.12)
  const [over, setOver] = useState(false)
  useFrame((_, dt) => {
    if (!g.current) return
    if (animate) {
      lift.target = over ? 0.22 : 0
      lift.step(dt)
      if (wait.current > 0) wait.current -= dt
      else rise.target = 1
      rise.step(dt)
    } else rise.value = 1 // paused or reduced motion: show the finished campus
    g.current.position.y = lift.value
    g.current.scale.set(1, Math.max(0.001, rise.value), 1)
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

/* Students walking the campus paths (the four lines drawn on the board). */
const WALKERS: { axis: 'x' | 'z'; line: number; speed: number; phase: number; tone: string }[] = [
  { axis: 'x', line: -0.55, speed: 0.22, phase: 0, tone: palette.ivory },
  { axis: 'x', line: -0.55, speed: -0.18, phase: 0.5, tone: palette.amber },
  { axis: 'x', line: 1.05, speed: 0.2, phase: 0.3, tone: palette.ivory },
  { axis: 'x', line: 1.05, speed: -0.25, phase: 0.8, tone: palette.lime },
  { axis: 'z', line: -0.95, speed: 0.2, phase: 0.15, tone: palette.ivory },
  { axis: 'z', line: 0.7, speed: -0.22, phase: 0.6, tone: palette.amber },
  { axis: 'z', line: 0.7, speed: 0.17, phase: 0.05, tone: palette.ivory },
]

function Walker({ w, animate }: { w: (typeof WALKERS)[number]; animate: boolean }) {
  const g = useRef<THREE.Group>(null)
  const t = useRef(w.phase)
  useFrame((_, dt) => {
    if (!g.current) return
    if (animate) t.current += dt * w.speed
    const u = (((t.current % 1) + 1) % 1) * 4.6 - 2.3 // along the path
    const bob = Math.abs(Math.sin(t.current * 90)) * 0.025
    if (w.axis === 'x') g.current.position.set(u, 0.13 + bob, w.line)
    else g.current.position.set(w.line, 0.13 + bob, u + 0.25)
  })
  return (
    <group ref={g}>
      <mesh>
        <capsuleGeometry args={[0.06, 0.1, 4, 8]} />
        <meshStandardMaterial color={w.tone} roughness={0.6} />
      </mesh>
    </group>
  )
}

/** Map pin hovering over the library (the reserved seat), with a pulse ring on the roof. */
function SeatPin({ animate }: { animate: boolean }) {
  const pin = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  const lib = BUILDINGS[0]
  const roof = lib.h + 0.13
  useFrame((_, dt) => {
    if (!pin.current || !ring.current) return
    if (animate) t.current += dt
    pin.current.position.y = roof + 0.45 + Math.sin(t.current * 2.2) * 0.07
    pin.current.rotation.y = t.current * 1.2
    const p = (t.current * 0.7) % 1
    ring.current.scale.setScalar(0.3 + p * 1.6)
    ;(ring.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - p)
  })
  return (
    <group position={[lib.x, 0, lib.z]}>
      <group ref={pin} scale={1.5}>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color={palette.amber} emissive={palette.amber} emissiveIntensity={0.35} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.2, 16]} />
          <meshStandardMaterial color={palette.amber} roughness={0.4} />
        </mesh>
      </group>
      <mesh ref={ring} position={[0, roof, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.22, 40]} />
        <meshBasicMaterial color={palette.amber} transparent opacity={0.6} side={THREE.DoubleSide} />
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
      {WALKERS.map((w, i) => (
        <Walker key={i} w={w} animate={animate} />
      ))}
      <SeatPin animate={animate} />
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
