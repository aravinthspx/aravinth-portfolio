import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Vector3, type Group, type Mesh, type MeshStandardMaterial } from 'three'
import { pointer, onPointerDown } from '../lib/pointer'
import { Spring1, Spring3 } from '../three/spring'
import { makeFinishes, palette } from '../three/materials'
import { StudioLights } from '../three/StudioLights'

/** Each layer follows the cursor on its own spring, so nearer pieces lag and overshoot more. */
function Layer({ depth, animate, children, position }: { depth: number; animate: boolean; children: ReactNode; position: [number, number, number] }) {
  const g = useRef<Group>(null)
  const s = useMemo(() => new Spring3(32 - depth * 6, 6.5), [depth])
  useFrame((_, dt) => {
    if (!g.current || !animate) return
    const on = pointer.inside && pointer.type === 'mouse'
    s.target.set(on ? pointer.x * 0.2 * depth : 0, on ? pointer.y * 0.15 * depth : 0, 0)
    s.step(dt)
    g.current.position.set(position[0] + s.pos.x, position[1] + s.pos.y, position[2])
    g.current.rotation.set(-s.pos.y * 0.5, s.pos.x * 0.6, 0)
  })
  return (
    <group ref={g} position={position}>
      {children}
    </group>
  )
}

/**
 * The one playful piece: hover makes it hop, click/tap makes it squash and bounce.
 * Hit-testing uses the shared window pointer (the canvas itself ignores pointer events
 * so it never blocks the buttons beside it).
 */
function Bouncer({ animate }: { animate: boolean }) {
  const mesh = useRef<Mesh>(null)
  const mat = useRef<MeshStandardMaterial>(null)
  const hop = useMemo(() => new Spring1(70, 4.2, 0), [])
  const squash = useMemo(() => new Spring1(220, 9, 1), [])
  const hovering = useRef(false)
  const screen = useRef({ x: -9999, y: -9999, r: 0 })
  const v = useMemo(() => new Vector3(), [])
  const { camera, gl } = useThree()

  const bump = (strength: number) => {
    if (!animate) return
    hop.kick(strength)
    squash.kick(strength * 1.2)
  }

  useEffect(
    () =>
      onPointerDown((e) => {
        const s = screen.current
        if (Math.hypot(e.clientX - s.x, e.clientY - s.y) < s.r) {
          squash.kick(-4)
          bump(5.5)
        }
      }),
    [animate],
  )
  useEffect(() => () => {
    if (hovering.current) document.body.style.cursor = ''
  }, [])

  useFrame((_, dt) => {
    const m = mesh.current
    if (!m) return
    if (animate) {
      hop.step(dt)
      squash.step(dt)
    }
    const sq = Math.max(0.6, squash.value)
    m.position.y = hop.value
    m.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq))

    // Project the ball to screen space for hover / click hit-testing.
    const rect = gl.domElement.getBoundingClientRect()
    m.getWorldPosition(v).project(camera)
    const s = screen.current
    s.x = rect.left + ((v.x + 1) / 2) * rect.width
    s.y = rect.top + ((1 - v.y) / 2) * rect.height
    s.r = rect.height * 0.065
    const over = pointer.inside && Math.hypot(pointer.px - s.x, pointer.py - s.y) < s.r
    if (over !== hovering.current) {
      hovering.current = over
      document.body.style.cursor = over ? 'pointer' : ''
      mat.current?.color.set(over ? palette.lime : palette.green)
      if (over) bump(3.2)
    }
  })

  return (
    <group position={[-0.8, -1.72, 1.4]}>
      <mesh ref={mesh}>
        <sphereGeometry args={[0.32, 48, 48]} />
        <meshStandardMaterial ref={mat} color={palette.green} roughness={0.32} metalness={0.05} />
      </mesh>
    </group>
  )
}

export default function HeroScene({ active, reduced, onReady }: { active: boolean; reduced: boolean; onReady?: () => void }) {
  const animate = active && !reduced
  const m = useMemo(() => makeFinishes(false), [])
  const spin = useRef<Group>(null)

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 8.45], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={animate ? 'always' : 'demand'}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
      style={{ pointerEvents: 'none' }}
    >
      <StudioLights />
      {/* Objects sit on the portrait's corners and edges (card spans roughly x ±1.6, y ±2.0), never over the face. */}
      {/* Matte black block on the lower-left corner */}
      <Layer depth={0.8} animate={animate} position={[-1.62, -1.85, 0.2]}>
        <RoundedBox args={[0.85, 0.85, 0.85]} radius={0.16} smoothness={6} rotation={[0.45, 0.65, 0.1]} material={m.matte} />
      </Layer>
      {/* Chrome ring on the top-right corner */}
      <Layer depth={1} animate={animate} position={[1.45, 1.9, 0.3]}>
        <Spinner animate={animate} groupRef={spin}>
          <mesh material={m.chrome} rotation={[1.1, 0.3, 0]}>
            <torusGeometry args={[0.5, 0.075, 32, 120]} />
          </mesh>
        </Spinner>
      </Layer>
      {/* Glass sphere resting on the right edge */}
      <Layer depth={1.4} animate={animate} position={[1.4, -0.95, 0.4]}>
        <mesh material={m.glass}>
          <sphereGeometry args={[0.55, 64, 64]} />
        </mesh>
      </Layer>
      {/* Small ivory capsule on the left edge */}
      <Layer depth={1.2} animate={animate} position={[-1.78, 1.0, 0.4]}>
        <mesh material={m.ivory} rotation={[0, 0, -0.7]}>
          <capsuleGeometry args={[0.16, 0.45, 12, 24]} />
        </mesh>
      </Layer>
      <Layer depth={2} animate={animate} position={[0, 0, 0]}>
        <Bouncer animate={animate} />
      </Layer>
    </Canvas>
  )
}

function Spinner({ animate, children, groupRef }: { animate: boolean; children: ReactNode; groupRef: React.RefObject<Group | null> }) {
  useFrame((_, dt) => {
    if (groupRef.current && animate) groupRef.current.rotation.y += dt * 0.12
  })
  return <group ref={groupRef}>{children}</group>
}
