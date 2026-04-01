import { type ThreeElement } from '@react-three/fiber'
import { AfterimagePass, UnrealBloomPass } from 'three-stdlib'

declare module '@react-three/fiber' {
  interface ThreeElements {
    afterimagePass: ThreeElement<typeof AfterimagePass>
    unrealBloomPass: ThreeElement<typeof UnrealBloomPass>
  }
}
