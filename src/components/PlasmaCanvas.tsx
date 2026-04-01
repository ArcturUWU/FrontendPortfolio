/* eslint-disable react-hooks/immutability, react-hooks/purity */
import { Effects, OrbitControls } from '@react-three/drei'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AfterimagePass, UnrealBloomPass } from 'three-stdlib'
import * as THREE from 'three'

extend({ AfterimagePass, UnrealBloomPass })

function ParticleSwarm() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const count = 15000
  const speedMult = 1
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const pColor = useMemo(() => new THREE.Color(), [])
  const blendColor = useMemo(() => new THREE.Color(), [])
  const emberColor = useMemo(() => new THREE.Color('#ff4b3e'), [])
  const goldColor = useMemo(() => new THREE.Color('#f9c47b'), [])
  const creamColor = useMemo(() => new THREE.Color('#f8efe8'), [])
  const cinderColor = useMemo(() => new THREE.Color('#241511'), [])
  const color = pColor

  const positions = useMemo(() => {
    const pos: THREE.Vector3[] = []

    for (let i = 0; i < count; i += 1) {
      pos.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
        ),
      )
    }

    return pos
  }, [count])

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        toneMapped: false,
        transparent: true,
        opacity: 0.78,
      }),
    [],
  )
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.22), [])

  const PARAMS = useMemo(
    () => ({ warp: 0, horizon: 50, disk: 500, chaos: 0 }),
    [],
  )

  const addControl = (
    id: keyof typeof PARAMS,
    _label: string,
    _min: number,
    _max: number,
    fallback: number,
  ) => {
    return PARAMS[id] ?? fallback
  }

  const setInfo = (...args: [string, string]) => {
    void args
  }

  const annotate = (...args: [string, THREE.Vector3, string]) => {
    void args
  }

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((state) => {
    if (!meshRef.current) {
      return
    }

    const time = state.clock.getElapsedTime() * speedMult

    const materialWithUniforms = material as THREE.MeshBasicMaterial & {
      uniforms?: {
        uTime?: { value: number }
      }
    }

    if (materialWithUniforms.uniforms?.uTime) {
      const uniform = materialWithUniforms.uniforms.uTime
      if (uniform && typeof uniform === 'object' && 'value' in uniform) {
        uniform.value = time
      }
    }

    for (let i = 0; i < count; i += 1) {
      const warp = addControl('warp', 'Warp Speed', 0.0, 5.0, 1.2)
      const horizon = addControl('horizon', 'Event Horizon', 1.0, 50.0, 12.0)
      const disk = addControl('disk', 'Disk Scale', 50.0, 500.0, 250.0)
      const chaos = addControl('chaos', 'Turbulence', 0.0, 3.0, 1.0)

      if (i === 0) {
        setInfo(
          'The Singularity',
          'Supermassive gravitational vortex, accretion disk, and relativistic jets.',
        )
        annotate('bh', new THREE.Vector3(0, 0, 0), 'Singularity')
      }

      const n = i / count

      const rawPhase = n - time * warp * 0.05
      const phase = rawPhase - Math.floor(rawPhase)

      const seed = Math.sin(i * 137.508)
      const jetMask = Math.pow(Math.abs(seed), 40.0)
      const diskMask = 1.0 - jetMask

      const rDisk = horizon + Math.pow(phase, 3.0) * disk
      const rJet = horizon * 0.3 * Math.abs(Math.cos(i * 55.5))
      const r = rDisk * diskMask + rJet * jetMask

      const orbitSpeed = (warp * 15.0) / Math.max(1.0, r - horizon + 1.0)
      const theta = i * 2.39996323 + time * orbitSpeed

      const yDisk =
        Math.cos(i * 88.8) * (rDisk - horizon) * 0.05 * chaos
      const yJet = Math.sign(seed) * (1.0 - phase) * disk * 2.0 * chaos
      let y = yDisk * diskMask + yJet * jetMask

      const proximity = Math.max(
        0.0,
        1.0 - (r - horizon) / (horizon * 2.5),
      )
      y += Math.sin(time * 15.0 + i * 100.0) * proximity * chaos * 3.0

      const x =
        Math.cos(theta) * r +
        Math.sin(time * 3.0 + yDisk) * proximity * chaos * 2.0
      const z =
        Math.sin(theta) * r +
        Math.cos(time * 3.0 + yDisk) * proximity * chaos * 2.0

      target.set(x, y, z)

      const distRatio = Math.max(
        0.0,
        Math.min(1.0, (rDisk - horizon) / disk),
      )
      const rimHeat = Math.pow(1.0 - distRatio, 2.15)
      const jetFlare = jetMask * Math.pow(1.0 - phase, 1.12)
      const emberGoldMix = THREE.MathUtils.clamp(
        0.18 + proximity * 0.46 + distRatio * 0.18,
        0,
        1,
      )
      const flicker = 0.9 + 0.1 * Math.sin(time * 18.0 + i * 53.0)
      const brightness =
        0.3 +
        rimHeat * 0.44 +
        jetFlare * 0.22 +
        proximity * 0.08

      color.copy(cinderColor)
      color.lerp(emberColor, 0.35 + rimHeat * 0.28)
      blendColor.lerpColors(emberColor, goldColor, emberGoldMix)
      color.lerp(blendColor, 0.52)
      color.lerp(creamColor, rimHeat * 0.12 + jetFlare * 0.28)
      color.lerp(cinderColor, distRatio * 0.22)
      color.multiplyScalar(brightness * flicker)

      positions[i].lerp(target, 0.085)
      dummy.position.copy(positions[i])
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      meshRef.current.setColorAt(i, pColor)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />
}

export function PlasmaCanvas() {
  const bloomResolution = useMemo(() => new THREE.Vector2(256, 256), [])
  const defaultPolarAngle = THREE.MathUtils.degToRad(60)
  const cameraDistance = 113
  const cameraPosition: [number, number, number] = [
    0,
    Math.cos(defaultPolarAngle) * cameraDistance,
    Math.sin(defaultPolarAngle) * cameraDistance,
  ]

  return (
    <div className="plasma-canvas" aria-hidden="true">
      <Canvas camera={{ position: cameraPosition, fov: 60 }}>
        <fog attach="fog" args={['#050505', 0.01]} />
        <ParticleSwarm />
        <OrbitControls
          autoRotate
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={defaultPolarAngle}
          minPolarAngle={defaultPolarAngle}
          target={[0, 0, 0]}
        />
        <Effects disableGamma>
          <afterimagePass args={[0.88]} />
          <unrealBloomPass
            args={[bloomResolution, 1.55, 0.52, 0.02]}
            radius={0.52}
            strength={1.55}
            threshold={0.02}
          />
        </Effects>
      </Canvas>
    </div>
  )
}
