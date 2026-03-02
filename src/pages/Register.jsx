import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import useAuth from '../hooks/useAuth'
import api from '../services/api'
import Card from '../components/ui/Card'

const PARTICLE_COLORS = ['#10b981', '#059669', '#34d399', '#f59e0b']

export default function Register() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const cardRef = useRef(null)
  const contentRef = useRef(null)
  const buttonRef = useRef(null)
  const particlesRef = useRef([])
  const animationFrameRef = useRef(null)
  const mouseRef = useRef({ x: null, y: null })
  const isExplodingRef = useRef(false)

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const createParticle = (width, height) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 0.45,
      dy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2 + 1,
      baseSize: Math.random() * 2 + 1,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    })

    const resize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width
      canvas.height = height

      const count = Math.max(60, Math.floor((width * height) / 15000))
      particlesRef.current = Array.from({ length: count }, () =>
        createParticle(width, height),
      )
    }

    const connectParticles = (width, height) => {
      const particles = particlesRef.current
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distanceSquared = dx * dx + dy * dy
          if (distanceSquared < (width / 9) * (height / 9)) {
            const opacity = Math.max(0, 1 - distanceSquared / 20000)
            if (opacity > 0) {
              ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.2})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }
      }
    }

    const render = () => {
      const width = canvas.width
      const height = canvas.height

      ctx.fillStyle = '#020617'
      ctx.fillRect(0, 0, width, height)

      const particles = particlesRef.current
      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i]

        particle.x += particle.dx
        particle.y += particle.dy

        if (particle.x <= 0 || particle.x >= width) particle.dx = -particle.dx
        if (particle.y <= 0 || particle.y >= height) particle.dy = -particle.dy

        if (!isExplodingRef.current && mouseRef.current.x !== null) {
          const mx = mouseRef.current.x
          const my = mouseRef.current.y
          const vx = mx - particle.x
          const vy = my - particle.y
          const distance = Math.sqrt(vx * vx + vy * vy)
          const maxDistance = 180

          if (distance > 0 && distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance
            particle.dx += (vx / distance) * force * 0.02
            particle.dy += (vy / distance) * force * 0.02
            particle.size = Math.min(4.5, particle.size + 0.08)
          } else {
            particle.size = Math.max(particle.baseSize, particle.size - 0.08)
          }
        }

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.shadowBlur = 10
        ctx.shadowColor = particle.color
        ctx.fill()
        ctx.shadowBlur = 0
      }

      if (!isExplodingRef.current) {
        connectParticles(width, height)
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    const onMouseMove = (event) => {
      mouseRef.current = { x: event.clientX, y: event.clientY }
    }

    const onMouseLeave = () => {
      mouseRef.current = { x: null, y: null }
    }

    resize()
    render()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseout', onMouseLeave)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseout', onMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || !cardRef.current || !contentRef.current) return

    const context = gsap.context(() => {
      const shouldDoorEnter = location?.state?.transition === 'door'

      gsap.set(contentRef.current.children, { opacity: 0, y: 12 })

      if (shouldDoorEnter) {
        gsap.set(cardRef.current, {
          opacity: 0,
          rotateY: 85,
          y: 0,
          scale: 1,
          transformOrigin: '50% 50%',
          transformPerspective: 1200,
        })
      } else {
        gsap.set(cardRef.current, { opacity: 0, y: 30, scale: 0.98, rotate: -2 })
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline.to(
        cardRef.current,
        shouldDoorEnter
          ? { opacity: 1, rotateY: 0, duration: 0.55 }
          : { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.55 },
      )
      timeline.to(
        contentRef.current.children,
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.3 },
        '-=0.25',
      )
    }, containerRef)

    return () => context.revert()
  }, [location])

  const playSuccessAnimation = () =>
    new Promise((resolve) => {
      if (!cardRef.current) {
        resolve()
        return
      }

      isExplodingRef.current = true
      const particles = particlesRef.current
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      particles.forEach((particle) => {
        const angle = Math.atan2(particle.y - centerY, particle.x - centerX)
        particle.dx = Math.cos(angle) * 5.5
        particle.dy = Math.sin(angle) * 5.5
        particle.color = '#10b981'
      })

      gsap
        .timeline({ defaults: { ease: 'power2.inOut' } })
        .to(buttonRef.current, { scale: 0.96, duration: 0.08 })
        .to(buttonRef.current, { scale: 1.02, duration: 0.12 })
        .to(cardRef.current, {
          y: 100,
          opacity: 0,
          duration: 0.45,
          scale: 0.96,
          ease: 'back.in(1.4)',
        })
        .call(resolve)
    })

  const playErrorAnimation = () => {
    if (!cardRef.current) return

    gsap
      .timeline({ defaults: { ease: 'power1.inOut' } })
      .to(cardRef.current, { x: -8, duration: 0.06 })
      .to(cardRef.current, { x: 8, duration: 0.06 })
      .to(cardRef.current, { x: -6, duration: 0.06 })
      .to(cardRef.current, { x: 6, duration: 0.06 })
      .to(cardRef.current, { x: 0, duration: 0.06 })
  }

  const handleSwitch = (event, path) => {
    event.preventDefault()

    if (!cardRef.current) {
      navigate(path)
      return
    }

    gsap
      .timeline({ defaults: { ease: 'power2.inOut' } })
      .set(cardRef.current, { transformOrigin: '50% 50%', transformPerspective: 1200 })
      .to(cardRef.current, { rotateY: -85, opacity: 0, duration: 0.45 })
      .call(() => navigate(path, { state: { transition: 'door' } }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      playErrorAnimation()
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      playErrorAnimation()
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/register', { email, password })
      await playSuccessAnimation()
      navigate('/login')
    } catch {
      setError('No se pudo crear la cuenta. El email podría estar en uso.')
      playErrorAnimation()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden px-4">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-br from-slate-950/60 via-[#020617]/35 to-slate-950/70" />

      <div className="relative z-20 flex min-h-screen items-center justify-center">
        <div ref={cardRef} className="w-full max-w-md">
          <Card className="rounded-3xl border-slate-700/60 bg-slate-900/85 px-7 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <div ref={contentRef} className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                Lumina Finance
              </p>
              <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
                Crear cuenta
              </h1>
              <p className="text-sm text-slate-400">
                Registrate para empezar a gestionar tus finanzas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-100">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ejemplo@lumina.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/75 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-100">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/75 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-100">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/75 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button
                ref={buttonRef}
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/40 transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                onClick={(event) => handleSwitch(event, '/login')}
                className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
              >
                Inicia sesion
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
