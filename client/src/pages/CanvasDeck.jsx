import { useEffect, useRef, useState } from 'react'

export default function CanvasDeck() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [slide, setSlide] = useState(0) // 0: fonctionnement, 1: apport pédagogique

  const slides = [
    {
      title: 'EcoSpy – Fonctionnement du jeu',
      bullets: [
        "Lobby: créer/rejoindre une partie, chat temps réel",
        "Salles (1→4): énigmes coopératives synchronisées via Socket.IO",
        "Validation serveur: logique de jeu et passage de salle",
        "Timer global: 20 minutes, progression et débrief final"
      ]
    },
    {
      title: 'EcoSpy – Apport pédagogique',
      bullets: [
        "Empreinte carbone: arbitrages concrets sur les postes d'émissions",
        "Océan: mémoire sur décomposition des déchets et impacts",
        "Forêts: coopération pour identifier les zones critiques",
        "Énergie: mix optimisé (renouvelables, budget, émissions)"
      ]
    }
  ]

  const draw = (ctx, w, h) => {
    // Background
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, w, h)

    // Frame
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = Math.max(2, w * 0.002)
    ctx.strokeRect(w * 0.03, h * 0.04, w * 0.94, h * 0.92)

    // Header
    ctx.fillStyle = '#10b981'
    ctx.font = `bold ${Math.max(18, Math.floor(w * 0.03))}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(slides[slide].title, w * 0.06, h * 0.08)

    // Subtitle hint
    ctx.fillStyle = '#94a3b8'
    ctx.font = `${Math.max(12, Math.floor(w * 0.014))}px Inter, system-ui, sans-serif`
    ctx.fillText('Cliquez ou tapez Espace pour passer la diapositive', w * 0.06, h * 0.14)

    // Bullets
    const bulletX = w * 0.08
    let y = h * 0.2
    const lineH = Math.max(20, Math.floor(h * 0.05))
    slides[slide].bullets.forEach((text) => {
      // dot
      ctx.fillStyle = '#10b981'
      ctx.beginPath()
      ctx.arc(bulletX, y + 6, 5, 0, Math.PI * 2)
      ctx.fill()

      // text
      ctx.fillStyle = '#e2e8f0'
      ctx.font = `${Math.max(14, Math.floor(w * 0.02))}px Inter, system-ui, sans-serif`
      wrapText(ctx, text, bulletX + 16, y - 2, w * 0.8, Math.max(18, Math.floor(w * 0.02)))
      y += lineH
    })

    // Footer progress
    const progressW = w * 0.2
    const progressX = w * 0.5 - progressW / 2
    const progressY = h * 0.9
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(progressX, progressY, progressW, 6)
    ctx.fillStyle = '#10b981'
    ctx.fillRect(progressX, progressY, progressW * ((slide + 1) / slides.length), 6)
  }

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y)
        line = words[n] + ' '
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, y)
  }

  const resizeAndRender = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const rect = container.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const width = Math.floor(rect.width)
    const height = Math.floor(rect.height)
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw(ctx, width, height)
  }

  useEffect(() => {
    resizeAndRender()
    const onResize = () => resizeAndRender()
    window.addEventListener('resize', onResize)
    const onKey = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        setSlide((s) => (s + 1) % slides.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    resizeAndRender()
  }, [slide])

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-3 text-gray-400 text-sm">
          <span className="mr-2">🎞️ Canvas – Deux diapositives</span>
          <span className="opacity-80">(Cliquer ou Espace pour avancer)</span>
        </div>
        <div
          ref={containerRef}
          className="w-full h-[60vh] md:h-[70vh] bg-black/60 rounded-xl border border-gray-700 overflow-hidden"
          onClick={() => setSlide((s) => (s + 1) % slides.length)}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  )
}



