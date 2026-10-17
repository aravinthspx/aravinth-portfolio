import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, RoundedBox, Sparkles, Torus, Icosahedron, Octahedron } from '@react-three/drei'
import type { Group } from 'three'

function Rig({ animate, children }: { animate: boolean; children: React.ReactNode }) {
  const g = useRef<Group>(null)
  useFrame((state, dt) => {
    if (!g.current || !animate) return
    // Subtle pointer parallax: ease toward the pointer, capped to a few degrees.
    const tx = state.pointer.y * -0.18
    const ty = state.pointer.x * 0.28
    g.current.rotation.x += (tx - g.current.rotation.x) * Math.min(1, dt * 3)
    g.current.rotation.y += (ty - g.current.rotation.y) * Math.min(1, dt * 3)
  })
  return <group ref={g}>{children}</group>
}

function Spinner({ speed, animate, children }: { speed: number; animate: boolean; children: React.ReactNode }) {
  const g = useRef<Group>(null)
  useFrame((_, dt) => {
    if (g.current && animate) {
      g.current.rotation.y += dt * speed
      g.current.rotation.z += dt * speed * 0.35
    }
  })
  return <group ref={g}>{children}</group>
}

export default function HeroScene({ active, reduced }: { active: boolean; reduced: boolean }) {
  const animate = active && !reduced
  const f = reduced ? 0 : 1
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7.5], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={animate ? 'always' : 'demand'}
      aria-hidden="true"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 6]} intensity={1.6} color="#fff4e6" />
      <pointLight position={[-4, -1, 3]} intensity={40} color="#8b5cf6" />
      <pointLight position={[4, -3, 2]} intensity={22} color="#22d3ee" />

      <Rig animate={animate}>
        {/* Core: a soft, slowly morphing form */}
        <Float speed={1.4 * f} rotationIntensity={0.4 * f} floatIntensity={0.8 * f}>
          <Icosahedron args={[1.35, 24]}>
            <MeshDistortMaterial color="#7c4dff" roughness={0.18} metalness={0.25} distort={reduced ? 0.2 : 0.32} speed={reduced ? 0 : 1.6} />
          </Icosahedron>
        </Float>

        {/* Orbit ring */}
        <Spinner speed={0.18} animate={animate}>
          <Torus args={[2.25, 0.025, 16, 160]} rotation={[Math.PI / 2.4, 0, 0]}>
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.2} />
          </Torus>
        </Spinner>

        {/* Cream blocks — campus buildings, abstracted */}
        <Float speed={2 * f} rotationIntensity={0.8 * f} floatIntensity={1.2 * f} position={[2.3, 1.25, 0.4]}>
          <RoundedBox args={[0.55, 0.9, 0.55]} radius={0.1} smoothness={4} rotation={[0.3, 0.6, 0.1]}>
            <meshPhysicalMaterial color="#f4efe6" roughness={0.35} clearcoat={1} />
          </RoundedBox>
        </Float>
        <Float speed={1.7 * f} rotationIntensity={0.6 * f} floatIntensity={1 * f} position={[2.85, 0.35, -0.6]}>
          <RoundedBox args={[0.38, 0.55, 0.38]} radius={0.08} smoothness={4} rotation={[0.2, 0.4, 0]}>
            <meshPhysicalMaterial color="#cfc8bc" roughness={0.4} clearcoat={0.6} />
          </RoundedBox>
        </Float>

        {/* Seeds / data points */}
        <Float speed={2.4 * f} rotationIntensity={1.2 * f} floatIntensity={1.4 * f} position={[-2.4, -1.1, 0.6]}>
          <Octahedron args={[0.42]}>
            <meshPhysicalMaterial color="#a78bfa" roughness={0.1} metalness={0.4} clearcoat={1} />
          </Octahedron>
        </Float>
        <Float speed={1.8 * f} floatIntensity={1.6 * f} position={[-2.1, 1.5, -0.4]}>
          <mesh>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} />
          </mesh>
        </Float>
        <Float speed={2.2 * f} floatIntensity={1.2 * f} position={[1.4, -1.8, 0.8]}>
          <Torus args={[0.28, 0.09, 16, 48]} rotation={[0.8, 0.3, 0]}>
            <meshPhysicalMaterial color="#f4efe6" roughness={0.25} clearcoat={1} />
          </Torus>
        </Float>

        <Sparkles count={reduced ? 0 : 40} scale={[7, 5, 3]} size={2} speed={0.3} color="#c4b5fd" opacity={0.6} />
      </Rig>
    </Canvas>
  )
}
