"use client"

import { useRef, useEffect } from "react"

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

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
        
        let animId: number
        let t = 0
        
        const animate = () => {
          t += 0.016
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
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%", 
        zIndex: 0, 
        pointerEvents: "none" 
      }}
    />
  )
}