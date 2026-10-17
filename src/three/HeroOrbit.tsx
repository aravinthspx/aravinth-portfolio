import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { pointer, installPointer } from '../lib/pointer'
import { Spring1, Spring3 } from './spring'

/*
 * Hero 3D scene: a particle "data globe" behind the name with project moons on tilted
 * orbits. The whole system leans toward the cursor; the globe can be dragged (desktop)
 * and pulses when clicked; moons grow and show a label on hover and open on click.
 */

export type MoonTarget = { id: string; label: string; sub: string; onSelect: () => void }

const CYAN = '#4fd9ea'
const LEAF = '#9fdc74'
const AMBER = '#e5b45f'

/** Points spread evenly over a sphere (Fibonacci lattice). */
function fibonacciSphere(n: number, r: number) {
  const arr = new Float32Array(n * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const rad = Math.sqrt(1 - y * y)
    const th = golden * i
    arr.set([Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r], i * 3)
  }
  return arr
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(79,217,234,0.55)')
  grd.addColorStop(0.35, 'rgba(79,217,234,0.18)')
  grd.addColorStop(1, 'rgba(79,217,234,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function Globe({ animate, mobile }: { animate: boolean; mobile: boolean }) {
  const spin = useRef<THREE.Group>(null)
  const pts = useRef<THREE.PointsMaterial>(null)
  const ring = useRef<THREE.Mesh>(null)
  const vel = useRef(0.12) // rad/s, drag adds to it and it eases back
  const drag = useRef<{ x: number } | null>(null)
  const pulse = useRef(-1)
  const size = useMemo(() => new Spring1(160, 9, 1), [])
  const R = 1.55
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(fibonacciSphere(mobile ? 520 : 1100, R), 3))
    return g
  }, [mobile])
  const wire = useMemo(() => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(R * 1.002, 2)), [])
  const tex = useMemo(glowTexture, [])
  const { gl } = useThree()

  useEffect(() => {
    const up = () => {
      drag.current = null
      gl.domElement.style.cursor = ''
    }
    window.addEventListener('pointerup', up)
    return () => window.removeEventListener('pointerup', up)
  }, [gl])

  useFrame((_, dt) => {
    const s = spin.current
    if (!s) return
    if (animate) {
      vel.current += (0.12 - vel.current) * Math.min(1, dt * 1.5)
      s.rotation.y += vel.current * dt
      size.step(dt)
      s.scale.setScalar(size.value)
    }
    if (pts.current) pts.current.size = (mobile ? 0.03 : 0.026) * (1 + Math.max(0, pulse.current >= 0 ? 1 - pulse.current : 0) * 0.8)
    const r = ring.current
    if (r) {
      if (pulse.current >= 0) {
        pulse.current += dt * 1.1
        r.visible = true
        r.scale.setScalar(1 + pulse.current * 1.4)
        ;(r.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - pulse.current) * 0.6
        if (pulse.current >= 1) pulse.current = -1
      } else r.visible = false
    }
  })

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.pointerType === 'mouse') {
      drag.current = { x: e.clientX }
      gl.domElement.style.cursor = 'grabbing'
    }
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    drag.current.x = e.clientX
    vel.current = THREE.MathUtils.clamp(vel.current + dx * 0.02, -4, 4)
  }

  return (
    <group>
      <sprite scale={[R * 4.4, R * 4.4, 1]}>
        <spriteMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <group
        ref={spin}
        rotation={[0.35, 0, 0.15]}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerOver={() => !drag.current && (gl.domElement.style.cursor = 'grab')}
        onPointerOut={() => !drag.current && (gl.domElement.style.cursor = '')}
        onClick={(e) => {
          e.stopPropagation()
          if (!animate) return
          pulse.current = 0
          size.kick(-2.5)
        }}
      >
        {/* dark core hides the far side so the globe reads as solid */}
        <mesh>
          <sphereGeometry args={[R * 0.985, 48, 48]} />
          <meshBasicMaterial color="#061220" transparent opacity={0.8} />
        </mesh>
        <lineSegments geometry={wire}>
          <lineBasicMaterial color={CYAN} transparent opacity={0.1} depthWrite={false} />
        </lineSegments>
        <points geometry={geo}>
          <pointsMaterial ref={pts} color="#a2eef7" size={0.026} sizeAttenuation transparent opacity={0.6} depthWrite={false} />
        </points>
        {/* equator band */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R * 1.12, 0.006, 8, 160]} />
          <meshBasicMaterial color={LEAF} transparent opacity={0.45} />
        </mesh>
      </group>
      <mesh ref={ring} visible={false}>
        <ringGeometry args={[R * 1.02, R * 1.06, 96]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function OrbitPath({ rx, rz, color }: { rx: number; rz: number; color: string }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [rx, rz])
  return (
    <lineLoop geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} />
    </lineLoop>
  )
}

type MoonShape = 'ico' | 'box' | 'octa'

function Moon({ target, shape, color, rx, rz, speed, phase, animate }: { target: MoonTarget; shape: MoonShape; color: string; rx: number; rz: number; speed: number; phase: number; animate: boolean }) {
  const g = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const scale = useMemo(() => new Spring1(180, 8, 1), [])
  const angle = useRef(phase)
  const [hover, setHover] = useState(false)
  const { gl, invalidate } = useThree()

  useFrame((_, dt) => {
    if (!g.current || !body.current) return
    if (animate) {
      angle.current += dt * speed * (hover ? 0.15 : 1) // slow down while hovered so it's easy to click
      body.current.rotation.x += dt * 0.6
      body.current.rotation.y += dt * 0.9
    }
    scale.target = hover ? 1.6 : 1
    scale.step(dt)
    g.current.position.set(Math.cos(angle.current) * rx, 0, Math.sin(angle.current) * rz)
    body.current.scale.setScalar(Math.max(0.5, scale.value))
    if (!animate && Math.abs(scale.value - scale.target) > 0.001) invalidate()
  })

  return (
    <group ref={g}>
      <group
        ref={body}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          scale.kick(4)
          gl.domElement.style.cursor = 'pointer'
          invalidate()
        }}
        onPointerOut={() => {
          setHover(false)
          gl.domElement.style.cursor = ''
          invalidate()
        }}
        onClick={(e) => {
          e.stopPropagation()
          gl.domElement.style.cursor = ''
          target.onSelect()
        }}
      >
        {shape === 'ico' && (
          <mesh>
            <icosahedronGeometry args={[0.26, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hover ? 0.9 : 0.35} flatShading roughness={0.5} />
          </mesh>
        )}
        {shape === 'box' && (
          <RoundedBox args={[0.38, 0.38, 0.38]} radius={0.07} smoothness={3}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hover ? 0.9 : 0.35} roughness={0.4} />
          </RoundedBox>
        )}
        {shape === 'octa' && (
          <mesh>
            <octahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hover ? 0.9 : 0.35} flatShading roughness={0.5} />
          </mesh>
        )}
        {/* generous invisible hit area so small moons are easy to hover and tap */}
        <mesh visible={false}>
          <sphereGeometry args={[0.5, 12, 12]} />
        </mesh>
      </group>
      {hover && (
        <Html center position={[0, 0.62, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[30, 0]}>
          <div className="whitespace-nowrap rounded-xl border border-accent/40 bg-ink/90 px-3 py-2 text-center shadow-[0_0_24px_-6px_rgba(79,217,234,0.7)] backdrop-blur">
            <p className="font-display text-sm font-bold text-cream">{target.label}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent">{target.sub}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

/** Leans the whole system toward the cursor with a spring, and fits it to narrow screens. */
function Rig({ animate, children }: { animate: boolean; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null)
  const s = useMemo(() => new Spring3(26, 6), [])
  const { viewport } = useThree()
  const fit = Math.min(1, viewport.width / 7.5)
  useFrame((_, dt) => {
    if (!g.current || !animate) return
    const on = pointer.inside && pointer.type === 'mouse'
    s.target.set(on ? -pointer.y * 0.22 : 0, on ? pointer.x * 0.35 : 0, 0)
    s.step(dt)
    g.current.rotation.set(s.pos.x, s.pos.y, 0)
  })
  return (
    <group ref={g} scale={fit} position={[0, -0.25, 0]}>
      {children}
    </group>
  )
}

function DepthDust({ count, animate }: { count: number; animate: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) arr.set([(rand() * 2 - 1) * 9, (rand() * 2 - 1) * 5, -6 + rand() * 8], i * 3)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [count])
  useFrame((_, dt) => {
    if (ref.current && animate) ref.current.rotation.y += dt * 0.01
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#dff8fc" size={0.03} sizeAttenuation transparent opacity={0.5} depthWrite={false} />
    </points>
  )
}

export default function HeroOrbit({ active, reduced, mobile, moons, onReady }: { active: boolean; reduced: boolean; mobile: boolean; moons: MoonTarget[]; onReady?: () => void }) {
  const animate = active && !reduced
  useEffect(() => installPointer(), [])
  const conf: { shape: MoonShape; color: string; rx: number; rz: number; speed: number; phase: number; tilt: [number, number, number] }[] = [
    { shape: 'ico', color: LEAF, rx: 3.0, rz: 3.0, speed: 0.32, phase: 0.6, tilt: [0.42, 0, -0.16] },
    { shape: 'box', color: CYAN, rx: 4.1, rz: 4.1, speed: 0.22, phase: 3.4, tilt: [0.5, 0, 0.2] },
    { shape: 'octa', color: AMBER, rx: 5.1, rz: 5.1, speed: 0.15, phase: 5.2, tilt: [0.36, 0, 0.06] },
  ]
  return (
    <Canvas
      dpr={mobile ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 9.5], fov: 45 }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
      frameloop={animate ? 'always' : 'demand'}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
    >
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 5, 6]} intensity={60} color="#ffffff" />
      <pointLight position={[-5, -2, 3]} intensity={30} color={CYAN} />
      <DepthDust count={mobile ? 120 : 280} animate={animate} />
      <Rig animate={animate}>
        <Globe animate={animate} mobile={mobile} />
        {moons.map((m, i) => {
          const c = conf[i % conf.length]
          return (
            <group key={m.id} rotation={c.tilt}>
              <OrbitPath rx={c.rx} rz={c.rz} color={c.color} />
              <Moon target={m} shape={c.shape} color={c.color} rx={c.rx} rz={c.rz} speed={c.speed} phase={c.phase} animate={animate} />
            </group>
          )
        })}
      </Rig>
    </Canvas>
  )
}
