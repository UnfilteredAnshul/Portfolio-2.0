"use client"

import { useRef, useEffect } from "react"

export default function Hero3D({ scale = 1 }: { scale?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const sceneRef = useRef<{ mesh: any; particles: any; renderer: any; camera: any } | null>(null)
  const currentScale = useRef(1)
  const animRef = useRef({ start: 1, end: 1, startTime: 0 })
  const lastScaleProp = useRef(scale)

  useEffect(() => {
    if (lastScaleProp.current !== scale) {
      animRef.current = {
        start: currentScale.current,
        end: scale,
        startTime: performance.now(),
      }
      lastScaleProp.current = scale
    }
  }, [scale])

  useEffect(() => {
    const container = containerRef.current
    if (!container || initializedRef.current) return

    initializedRef.current = true

    const init3D = async () => {
      try {
        const THREE = await import("three")

        const existing = container.querySelector("canvas")
        if (existing) existing.remove()

        const canvas = document.createElement("canvas")
        canvas.style.cssText = "width:100%;height:100%;display:block;"
        container.appendChild(canvas)

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight || 1, 0.1, 1000)
        camera.position.z = 8

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
        renderer.setSize(container.clientWidth, container.clientHeight)
        renderer.setPixelRatio(1)

        const geom = new THREE.IcosahedronGeometry(1, 1)
        const mat = new THREE.MeshBasicMaterial({ color: 0xff6b6b, wireframe: true })
        const mesh = new THREE.Mesh(geom, mat)
        mesh.scale.setScalar(2.5)
        scene.add(mesh)

        const pos = new Float32Array(500 * 3)
        for (let i = 0; i < 500; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 15
          pos[i * 3 + 1] = (Math.random() - 0.5) * 15
          pos[i * 3 + 2] = (Math.random() - 0.5) * 15
        }
        const pGeom = new THREE.BufferGeometry()
        pGeom.setAttribute("position", new THREE.BufferAttribute(pos, 3))
        const pMat = new THREE.PointsMaterial({ size: 0.03, color: 0xffffff, transparent: true, opacity: 0.5 })
        const particles = new THREE.Points(pGeom, pMat)
        scene.add(particles)

        sceneRef.current = { mesh, particles, renderer, camera }

        let animId: number
        let t = 0

        const animate = () => {
          t += 0.016

          const anim = animRef.current
          const now = performance.now()
          const elapsed = now - anim.startTime
          if (elapsed < 750) {
            const progress = elapsed / 750
            const eased = 1 - Math.pow(1 - progress, 3)
            currentScale.current = anim.start + (anim.end - anim.start) * eased
          } else {
            currentScale.current = anim.end
          }

          mesh.scale.setScalar(2.5 * currentScale.current)
          particles.scale.setScalar(currentScale.current)

          mesh.rotation.x = Math.sin(t * 0.3) * 0.2
          mesh.rotation.y = t * 0.5
          particles.rotation.y = t * 0.1
          renderer.render(scene, camera)
          animId = requestAnimationFrame(animate)
        }

        animate()

        const handleResize = () => {
          if (container.clientWidth && container.clientHeight) {
            camera.aspect = container.clientWidth / container.clientHeight
            camera.updateProjectionMatrix()
            renderer.setSize(container.clientWidth, container.clientHeight)
          }
        }

        window.addEventListener("resize", handleResize)

        const visibilityHandler = () => {
          if (!document.hidden && container.querySelector("canvas")) {
            handleResize()
          }
        }
        document.addEventListener("visibilitychange", visibilityHandler)

        return () => {
          cancelAnimationFrame(animId)
          window.removeEventListener("resize", handleResize)
          document.removeEventListener("visibilitychange", visibilityHandler)
          renderer.dispose()
        }
      } catch (e) {
        console.error("3D init failed:", e)
        initializedRef.current = false
      }
    }

    init3D()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  )
}
