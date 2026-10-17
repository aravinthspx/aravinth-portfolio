import { Environment, Lightformer } from '@react-three/drei'

/**
 * Soft studio lighting with a locally generated environment map (no HDR download).
 * Gives chrome and glass something to reflect: soft white, pale green, a warm low fill.
 */
export function StudioLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.35 * intensity} />
      <directionalLight position={[4, 6, 5]} intensity={1.4 * intensity} color="#fffaf0" />
      <pointLight position={[-5, 2, 3]} intensity={18 * intensity} color="#dfeccc" />
      <pointLight position={[3, -4, 2]} intensity={8 * intensity} color="#e8c99a" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, -4]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.1} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} color="#dfeccc" />
        <Lightformer form="rect" intensity={0.7} position={[6, -1, 1]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} color="#f0d7ae" />
        <Lightformer form="ring" intensity={1.4} position={[2, 3, 6]} scale={3} color="#ffffff" />
      </Environment>
    </>
  )
}
