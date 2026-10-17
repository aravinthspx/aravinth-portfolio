import { MeshPhysicalMaterial, MeshStandardMaterial, type Material } from 'three'

// Neutral material palette shared by every scene: matte black, chrome, glass, ivory, muted green.
export type Finish = 'glass' | 'chrome' | 'matte' | 'ivory' | 'green'

export const palette = {
  ink: '#11110f',
  matte: '#1c1c1a',
  chrome: '#d6d5d0',
  ivory: '#ece6d8',
  green: '#8fa874',
  greenDark: '#64794f',
  soil: '#6b5642',
  amber: '#d9a95b',
  stone: '#c6c2b8',
  lime: '#cfe3a0',
}

/**
 * Cheap, fast-compiling finishes. Glass is faked with clearcoat reflections + transparency
 * instead of real transmission, which needs an extra render pass and very slow shader
 * compiles on some GPUs. `lite` (phones) drops clearcoat too.
 */
export function makeFinishes(lite: boolean): Record<Finish, Material> {
  return {
    glass: lite
      ? new MeshStandardMaterial({ color: '#e4ebdf', roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.38 })
      : new MeshPhysicalMaterial({ color: '#e8eee3', roughness: 0.05, metalness: 0.15, transparent: true, opacity: 0.42, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6 }),
    chrome: new MeshStandardMaterial({ color: palette.chrome, metalness: 1, roughness: 0.14 }),
    matte: new MeshStandardMaterial({ color: palette.matte, metalness: 0.1, roughness: 0.82 }),
    ivory: new MeshStandardMaterial({ color: palette.ivory, roughness: 0.42 }),
    green: new MeshStandardMaterial({ color: palette.green, roughness: 0.55, metalness: 0.05 }),
  }
}
