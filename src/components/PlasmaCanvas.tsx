import { useEffect, useRef } from 'react'

type Blob = {
  drift: number
  hue: string
  radius: number
  seed: number
  speed: number
  x: number
  y: number
}

const palette = ['255, 75, 62', '249, 196, 123', '142, 163, 255']

export function PlasmaCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const canvasElement: HTMLCanvasElement = canvas
    const context2d: CanvasRenderingContext2D = context

    const pointer = {
      x: window.innerWidth * 0.7,
      y: window.innerHeight * 0.3,
    }

    const blobs: Blob[] = Array.from({ length: 5 }, (_, index) => ({
      drift: 0.0016 + index * 0.0004,
      hue: palette[index % palette.length],
      radius: 180 + index * 38,
      seed: 120 + index * 55,
      speed: 0.3 + index * 0.14,
      x: window.innerWidth * (0.24 + index * 0.16),
      y: window.innerHeight * (0.22 + (index % 2) * 0.2),
    }))

    let animationFrame = 0
    let width = 0
    let height = 0
    let pixelRatio = 1

    function resizeCanvas() {
      width = window.innerWidth
      height = Math.max(window.innerHeight, document.body.scrollHeight)
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

      canvasElement.width = width * pixelRatio
      canvasElement.height = height * pixelRatio
      canvasElement.style.width = `${width}px`
      canvasElement.style.height = `${height}px`

      context2d.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    function handlePointerMove(event: PointerEvent) {
      pointer.x = event.clientX
      pointer.y = event.clientY + window.scrollY * 0.15
    }

    function draw(time: number) {
      context2d.clearRect(0, 0, width, height)
      context2d.globalCompositeOperation = 'screen'

      for (let index = 0; index < blobs.length; index += 1) {
        const blob = blobs[index]
        const oscillationX = Math.sin(time * blob.drift + blob.seed) * 80
        const oscillationY = Math.cos(time * blob.drift * 1.4 + blob.seed) * 96
        const anchorX =
          index === 0
            ? pointer.x * 0.72 + width * 0.12
            : blob.x + oscillationX * blob.speed
        const anchorY =
          index === 0
            ? pointer.y * 0.72 + height * 0.04
            : blob.y + oscillationY * blob.speed
        const gradient = context2d.createRadialGradient(
          anchorX,
          anchorY,
          0,
          anchorX,
          anchorY,
          blob.radius,
        )

        gradient.addColorStop(0, `rgba(${blob.hue}, 0.28)`)
        gradient.addColorStop(0.4, `rgba(${blob.hue}, 0.18)`)
        gradient.addColorStop(1, `rgba(${blob.hue}, 0)`)

        context2d.fillStyle = gradient
        context2d.beginPath()
        context2d.arc(anchorX, anchorY, blob.radius, 0, Math.PI * 2)
        context2d.fill()
      }

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(draw)
      }
    }

    resizeCanvas()
    draw(0)

    if (!reducedMotion) {
      animationFrame = window.requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('pointermove', handlePointerMove)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="plasma-canvas" aria-hidden="true" />
}
