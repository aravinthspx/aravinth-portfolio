import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { pointer, onPointerDown, isInteractiveTarget } from '../lib/pointer'
import { Spring1, Spring3 } from './spring'
import { makeFinishes, palette, type Finish } from './materials'
import { StudioLights } from './StudioLights'

/*
 * Ambient background: a tall column of objects that the camera travels down as
 * the page scrolls. Objects sit in the page margins, drift slowly, lean away
 * from a nearby cursor, hop when it passes close, and bounce + ripple on click.
 */

const CAM_Z = 10
const FOV = 45
const SPAN = 36 // world units travelled from page top to bottom

type Shape = 'sphere' | 'box' | 'torus' | 'capsule' | 'ico'
type Def = { finish: Finish; shape: Shape; fx: number; y: number; z: number; s: number; mobile?: boolean }

// fx = fraction of the visible half-width (±1 = screen edge) so objects hug the margins.
const DEFS: Def[] = [
  { finish: 'glass', shape: 'sphere', fx: -1.02, y: 3.4, z: -1, s: 0.75, mobile: true },
  { finish: 'matte', shape: 'box', fx: 0.97, y: -2.8, z: -3, s: 0.7 },
  { finish: 'chrome', shape: 'torus', fx: -1.0, y: -5.8, z: -2, s: 0.55 },
  { finish: 'ivory', shape: 'capsule', fx: 0.97, y: -7.5, z: -1.5, s: 0.6, mobile: true },
  { finish: 'glass', shape: 'sphere', fx: -0.97, y: -10, z: -2.5, s: 0.9 },
  { finish: 'green', shape: 'ico', fx: 0.97, y: -12.8, z: -1, s: 0.5 },
  { finish: 'chrome', shape: 'sphere', fx: -0.97, y: -15.2, z: -0.5, s: 0.42, mobile: true },
  { finish: 'matte', shape: 'torus', fx: 0.97, y: -17.8, z: -3, s: 0.75 },
  { finish: 'glass', shape: 'box', fx: -0.97, y: -20.6, z: -2, s: 0.62 },
  { finish: 'ivory', shape: 'sphere', fx: 0.97, y: -23.2, z: -1, s: 0.5, mobile: true },
  { finish: 'chrome', shape: 'capsule', fx: -0.97, y: -26, z: -1.5, s: 0.5 },
  { finish: 'green', shape: 'sphere', fx: 0.97, y: -28.6, z: -2.5, s: 0.65 },
  { finish: 'matte', shape: 'ico', fx: -0.97, y: -31.2, z: -1, s: 0.6, mobile: true },
  { finish: 'glass', shape: 'sphere', fx: 0.97, y: -34, z: -1, s: 0.95 },
  { finish: 'chrome', shape: 'torus', fx: -1.08, y: -36.6, z: -2, s: 0.6 },
]

type Hit = { sx: number; sy: number; visible: boolean; bounce: () => void }
type Shared = { animate: boolean; scrollVel: number; hits: Hit[]; live: THREE.Vector3[] }

/** Deterministic pseudo-random numbers so the particle field is identical on every render. */
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

const halfHeightAt = (z: number) => Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * (CAM_Z - z)

function ShapeMesh({ shape, material }: { shape: Shape; material: THREE.Material }) {
  switch (shape) {
    case 'sphere':
      return (
        <mesh material={material}>
          <sphereGeometry args={[1, 48, 48]} />
        </mesh>
      )
    case 'box':
      return <RoundedBox args={[1.4, 1.4, 1.4]} radius={0.28} smoothness={5} material={material} />
    case 'torus':
      return (
        <mesh material={material}>
          <torusGeometry args={[0.85, 0.3, 32, 96]} />
        </mesh>
      )
    case 'capsule':
      return (
        <mesh material={material} rotation={[0, 0, 0.6]}>
          <capsuleGeometry args={[0.45, 0.9, 12, 24]} />
        </mesh>
      )
    case 'ico':
      return (
        <mesh material={material}>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      )
  }
}

function Item({ def, index, shared, material }: { def: Def; index: number; shared: Shared; material: THREE.Material }) {
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const body = useMemo(() => new Spring3(38, 5.5), [])
  const scale = useMemo(() => new Spring1(140, 8, 1), [])
  const local = useRef({ cool: 0, ripple: -1, spin: 0, seed: index * 1.7 })
  const proj = useMemo(() => new THREE.Vector3(), [])
  const { camera, size } = useThree()

  useEffect(() => {
    const hit: Hit = {
      sx: -9999,
      sy: -9999,
      visible: false,
      bounce: () => {
        body.kick(0, 5.5)
        scale.kick(-3.5)
        local.current.spin += 4
        local.current.ripple = 0
      },
    }
    shared.hits[index] = hit
    shared.live[index] = new THREE.Vector3()
  }, [shared, index, body, scale])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const L = local.current
    const t = state.clock.elapsedTime
    const baseX = def.fx * halfHeightAt(def.z) * (size.width / size.height)

    if (shared.animate) {
      const hit = shared.hits[index]
      proj.copy(g.position).project(camera)
      const sx = ((proj.x + 1) / 2) * size.width
      const sy = ((1 - proj.y) / 2) * size.height
      if (hit) {
        hit.sx = sx
        hit.sy = sy
        hit.visible = proj.z < 1 && sy > -200 && sy < size.height + 200
      }

      // Soft repel from a nearby (mouse) cursor, plus a playful hop when it gets close.
      const dx = sx - pointer.px
      const dy = sy - pointer.py
      const d = Math.hypot(dx, dy) || 1
      const R = 260 * (def.s + 0.35)
      if (pointer.inside && pointer.type === 'mouse' && d < R) {
        const f = 1 - d / R
        body.target.set((dx / d) * f * 0.7, (-dy / d) * f * 0.7, 0)
        if (d < R * 0.4 && L.cool <= 0) {
          body.kick((dx / d) * 0.8, 3.2)
          scale.kick(1.6)
          L.spin += 2.2
          L.cool = 1.4
        }
      } else {
        body.target.set(0, 0, 0)
      }
      // Scrolling (including touch) gives objects a gentle lagging sway.
      body.vel.y += shared.scrollVel * 0.004 * (1 + def.z * -0.15)

      body.step(dt)
      scale.step(dt)
      L.cool -= dt
      L.spin *= Math.exp(-dt * 2.2)
      g.rotation.x += (0.06 + L.spin * 0.4) * dt
      g.rotation.y += (0.09 + L.spin) * dt
    }

    const drift = shared.animate ? Math.sin(t * 0.35 + L.seed) * 0.16 : 0
    g.position.set(baseX + body.pos.x, def.y + drift + body.pos.y, def.z + body.pos.z)
    g.scale.setScalar(def.s * Math.max(0.6, scale.value))
    shared.live[index]?.copy(g.position)

    // Click ripple: an expanding, fading ring facing the camera.
    const r = ring.current
    if (r) {
      if (L.ripple >= 0) {
        L.ripple += dt * 1.3
        r.visible = true
        r.position.copy(g.position)
        r.scale.setScalar(def.s * (1.3 + L.ripple * 2.4))
        ;(r.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - L.ripple) * 0.55
        if (L.ripple >= 1) L.ripple = -1
      } else r.visible = false
    }
  })

  return (
    <>
      <group ref={group} rotation={[index * 0.7, index * 1.3, 0]}>
        <ShapeMesh shape={def.shape} material={material} />
      </group>
      <mesh ref={ring} visible={false}>
        <ringGeometry args={[1, 1.035, 72]} />
        <meshBasicMaterial color={palette.lime} transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}

/** Faint lines linking neighbouring objects on the same side of the page. */
function Links({ shared, defs }: { shared: Shared; defs: Def[] }) {
  const pairs = useMemo(() => {
    const out: [number, number][] = []
    defs.forEach((d, i) => {
      const j = defs.findIndex((e, k) => k > i && Math.sign(e.fx) === Math.sign(d.fx))
      if (j > 0 && Math.abs(defs[j].y - d.y) < 7) out.push([i, j])
    })
    return out
  }, [defs])
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pairs.length * 6), 3))
    return g
  }, [pairs])
  useFrame(() => {
    const a = geo.attributes.position as THREE.BufferAttribute
    pairs.forEach(([i, j], n) => {
      const p = shared.live[i]
      const q = shared.live[j]
      if (!p || !q) return
      a.setXYZ(n * 2, p.x, p.y, p.z)
      a.setXYZ(n * 2 + 1, q.x, q.y, q.z)
    })
    a.needsUpdate = true
    geo.computeBoundingSphere()
  })
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={palette.stone} transparent opacity={0.1} depthWrite={false} />
    </lineSegments>
  )
}

function Particles({ count, animate }: { count: number; animate: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const rand = rng(42)
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() * 2 - 1) * 9
      arr[i * 3 + 1] = 4 - rand() * (SPAN + 10)
      arr[i * 3 + 2] = -6 + rand() * 6
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [count])
  useFrame((s) => {
    if (animate && ref.current) ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.12) * 0.25
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#dcd8ce" size={0.035} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
    </points>
  )
}

/** Wireframe terrain the visitor arrives at near the bottom of the page. */
function Terrain({ segments }: { segments: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(44, 16, segments, Math.round(segments / 2.6))
    const p = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const y = p.getY(i)
      p.setZ(i, Math.sin(x * 0.35) * Math.cos(y * 0.5) * 0.9 + Math.sin(x * 0.9 + y * 0.7) * 0.35)
    }
    g.computeVertexNormals()
    return g
  }, [segments])
  return (
    <mesh geometry={geo} position={[0, -SPAN - 3.4, -4]} rotation={[-Math.PI / 2.25, 0, 0]}>
      <meshBasicMaterial color={palette.green} wireframe transparent opacity={0.3} depthWrite={false} />
    </mesh>
  )
}

function Rig({ shared }: { shared: Shared }) {
  const { camera, invalidate } = useThree()
  const last = useRef(0)
  useEffect(() => {
    if (shared.animate) return
    // Reduced motion: stay put on the hero composition; just render once.
    camera.position.set(0, 0, CAM_Z)
    invalidate()
  }, [shared.animate, camera, invalidate])

  useFrame((_, dt) => {
    if (!shared.animate) return
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const y = window.scrollY
    const progress = Math.min(1, y / max)
    shared.scrollVel = THREE.MathUtils.lerp(shared.scrollVel, (y - last.current) / Math.max(dt, 1 / 120) / 60, 0.2)
    last.current = y
    const fine = pointer.type === 'mouse' && pointer.inside
    const tx = fine ? pointer.x * 0.45 : 0
    const ty = -progress * SPAN + (fine ? pointer.y * 0.3 : 0)
    const k = 1 - Math.exp(-dt * 4)
    camera.position.x += (tx - camera.position.x) * k
    camera.position.y += (ty - camera.position.y) * k
  })
  return null
}

function Clicks({ shared }: { shared: Shared }) {
  useEffect(
    () =>
      onPointerDown((e) => {
        if (!shared.animate || isInteractiveTarget(e.target)) return
        let best: Hit | null = null
        let bestD = 150
        for (const h of shared.hits) {
          if (!h?.visible) continue
          const d = Math.hypot(h.sx - e.clientX, h.sy - e.clientY)
          if (d < bestD) {
            bestD = d
            best = h
          }
        }
        best?.bounce()
      }),
    [shared],
  )
  return null
}

export default function BackgroundScene({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const defs = useMemo(() => (mobile ? DEFS.filter((d) => d.mobile) : DEFS), [mobile])
  const finishes = useMemo(() => makeFinishes(mobile), [mobile])
  const shared = useMemo<Shared>(() => ({ animate: !reduced, scrollVel: 0, hits: [], live: [] }), [reduced])

  return (
    <Canvas
      dpr={mobile ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 60 }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: 'low-power' }}
      frameloop={reduced ? 'demand' : 'always'}
      style={{ pointerEvents: 'none' }}
    >
      <fog attach="fog" args={[palette.ink, 9, 24]} />
      <StudioLights intensity={0.9} />
      <Rig shared={shared} />
      <Clicks shared={shared} />
      {defs.map((d, i) => (
        <Item key={i} def={d} index={i} shared={shared} material={finishes[d.finish]} />
      ))}
      {!mobile && <Links shared={shared} defs={defs} />}
      <Particles count={mobile ? 90 : 260} animate={!reduced} />
      <Terrain segments={mobile ? 40 : 88} />
    </Canvas>
  )
}
