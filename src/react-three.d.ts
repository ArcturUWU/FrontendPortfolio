import { type ThreeElement } from '@react-three/fiber'
import { UnrealBloomPass } from 'three-stdlib'

declare module '@react-three/fiber' {
  interface ThreeElements {
    unrealBloomPass: ThreeElement<typeof UnrealBloomPass>
  }
}
