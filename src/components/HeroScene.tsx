import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import type { Group, Mesh } from 'three'
import { pointer } from '../lib/pointer'
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
    s.target.set(on ? pointer.x * 0.35 * depth : 0, on ? pointer.y * 0.25 * depth : 0, 0)
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

/** The one playful piece: hover makes it hop, click makes it squash and bounce. */
function Bouncer({ animate }: { animate: boolean }) {
  const mesh = useRef<Mesh>(null)
  const hop = useMemo(() => new Spring1(70, 4.2, 0), [])
  const squash = useMemo(() => new Spring1(220, 9, 1), [])
  const [hover, setHover] = useState(false)

  useFrame((_, dt) => {
    if (!mesh.current) return
    if (animate) {
      hop.step(dt)
      squash.step(dt)
    }
    const sq = Math.max(0.6, squash.value)
    mesh.current.position.y = hop.value
    mesh.current.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq))
  })

  const bump = (strength: number) => {
    if (!animate) return
    hop.kick(strength)
    squash.kick(strength * 1.2)
  }

  return (
    <group position={[-0.3, -1.6, 1.4]}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          document.body.style.cursor = 'pointer'
          bump(3.2)
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          squash.kick(-4)
          bump(5.5)
        }}
      >
        <sphereGeometry args={[0.36, 48, 48]} />
        <meshStandardMaterial color={hover ? palette.lime : palette.green} roughness={0.32} metalness={0.05} />
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
      camera={{ position: [0, 0, 7.5], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={animate ? 'always' : 'demand'}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
      data-interactive
    >
      <StudioLights />
      {/* Matte black block anchors the composition */}
      <Layer depth={0.6} animate={animate} position={[-0.2, 0.25, -0.8]}>
        <RoundedBox args={[1.9, 1.9, 1.9]} radius={0.32} smoothness={6} rotation={[0.45, 0.65, 0.1]} material={m.matte} />
      </Layer>
      {/* Chrome ring orbiting it */}
      <Layer depth={1} animate={animate} position={[0.15, 0.1, 0]}>
        <Spinner animate={animate} groupRef={spin}>
          <mesh material={m.chrome} rotation={[1.15, 0.2, 0]}>
            <torusGeometry args={[1.75, 0.07, 32, 160]} />
          </mesh>
        </Spinner>
      </Layer>
      {/* Glass sphere refracting the block behind */}
      <Layer depth={1.6} animate={animate} position={[1.05, -0.55, 1.2]}>
        <mesh material={m.glass}>
          <sphereGeometry args={[0.8, 64, 64]} />
        </mesh>
      </Layer>
      {/* Small ivory capsule for warmth */}
      <Layer depth={1.3} animate={animate} position={[1.35, 1.45, 0.4]}>
        <mesh material={m.ivory} rotation={[0, 0, -0.7]}>
          <capsuleGeometry args={[0.2, 0.55, 12, 24]} />
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
