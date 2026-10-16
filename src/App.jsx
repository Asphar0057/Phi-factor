import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import './App.css'
import phi from './assets/phi.svg'
import PhiScramble from './PhiScramble'
import PortfolioImage from './PortfolioImage'
import { sections, layoutFor, frameSrc } from './projects'

const pad = (n) => String(n).padStart(2, '0')

// where each category sits in the home bento
const homeSpots = {
  advertising: ['1 / 8', '1 / 3'],
  corporate: ['8 / 13', '1 / 3'],
  'music-videos': ['1 / 7', '3 / 5'],
  films: ['7 / 13', '3 / 5'],
}

const PHONE = { label: '+91 80882 19356', href: 'tel:+918088219356' }

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      // wait a frame so the target has rendered after a route change
      requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView())
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

const serviceOrder = sections.map((s) => s.id)

function ServiceIndex() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const dismissPreview = (event) => {
      if (event.key === 'Escape') setDismissed(true)
    }
    document.addEventListener('keydown', dismissPreview)
    return () => document.removeEventListener('keydown', dismissPreview)
  }, [])

  return (
    <ul className="service-index" aria-label="Film categories">
      {serviceOrder.map((id) => {
        const section = sections.find((item) => item.id === id)
        // caption the project the cover still actually comes from
        const coverProject = section.projects.find((p) =>
          p.clusters.some((c) => section.cover?.startsWith(`/work/${c.base}-`))) ?? section.projects[0]
        return (
          <li key={id}>
            <Link
              className="service-link"
              to={`/${id}`}
              data-preview-dismissed={dismissed}
              onPointerEnter={() => setDismissed(false)}
              onFocus={() => setDismissed(false)}
            >
              <span className="service-label">{section.title}</span>
              <span className={`service-preview${section.cover ? '' : ' service-preview-empty'}`} aria-hidden="true">
                {section.cover ? (
                  <>
                    <span className="service-preview-image"><PortfolioImage src={section.cover} /></span>
                    <span className="service-preview-caption">{coverProject?.name}<span>›</span></span>
                  </>
                ) : <span className="service-preview-note">{section.title}<br />Coming soon ›</span>}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

// on home the header waits until the logo has scrolled away
function useScrolledPast(enabled) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    if (!enabled) return
    const check = () => {
      const landing = document.querySelector('.landing')
      setPast(landing ? landing.getBoundingClientRect().bottom < window.innerHeight * 0.5 : false)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [enabled])
  return past
}

function useLandingReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const landing = ref.current
    if (!landing) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const update = () => {
      frame = 0
      const travel = Math.min(140, Math.max(60, window.innerWidth * 0.1))
      const lift = Math.min(64, Math.max(24, window.innerHeight * 0.055))
      const distance = Math.max(1, (landing.offsetHeight - window.innerHeight) * 0.75)
      const progress = reduceMotion.matches
        ? 1
        : Math.min(1, Math.max(0, -landing.getBoundingClientRect().top / distance))
      const reveal = 1 - (1 - progress) ** 3

      landing.style.setProperty('--name-opacity', reveal.toFixed(3))
      landing.style.setProperty('--name-offset', `${((1 - reveal) * travel).toFixed(1)}px`)
      landing.style.setProperty('--logo-offset', `${(-reveal * lift).toFixed(1)}px`)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    reduceMotion.addEventListener('change', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reduceMotion.removeEventListener('change', schedule)
    }
  }, [])

  return ref
}

function useScrollFades() {
  const aboutHeadingRef = useRef(null)
  const aboutTextRef = useRef(null)
  const workHeadingRef = useRef(null)
  const workCardsRef = useRef(null)

  useEffect(() => {
    const aboutHeading = aboutHeadingRef.current
    const aboutText = aboutTextRef.current
    const workHeading = workHeadingRef.current
    const workCards = workCardsRef.current
    if (!aboutHeading || !aboutText || !workHeading || !workCards) return

    const groups = [
      { trigger: aboutHeading, elements: [aboutHeading, aboutText] },
      { trigger: workHeading, elements: [workHeading, workCards] },
    ]

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const update = () => {
      frame = 0
      const start = window.innerHeight * 0.95
      const end = window.innerHeight * 0.25
      const travel = Math.min(80, Math.max(48, window.innerWidth * 0.055))

      groups.forEach(({ trigger, elements }) => {
        const top = trigger.offsetParent.getBoundingClientRect().top + trigger.offsetTop
        const progress = reduceMotion.matches
          ? 1
          : Math.min(1, Math.max(0, (start - top) / (start - end)))
        const reveal = progress * progress * (3 - 2 * progress)
        elements.forEach((element) => {
          element.style.setProperty('--fade-opacity', reveal.toFixed(3))
          element.style.setProperty('--fade-offset', `${((1 - reveal) * travel).toFixed(1)}px`)
        })
      })
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    reduceMotion.addEventListener('change', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reduceMotion.removeEventListener('change', schedule)
    }
  }, [])

  return { aboutHeadingRef, aboutTextRef, workHeadingRef, workCardsRef }
}

function Nav({ isHome, shown }) {
  return (
    <header
      className={`site-header${isHome ? ' is-home' : ''}${isHome && !shown ? ' is-hidden' : ''}`}
      inert={isHome && !shown ? true : undefined}
    >
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="The Phi Factor home"><img src={phi} alt="" /></Link>
        <ServiceIndex />
        <ul className="nav-links">
          <li><Link to="/#about">About</Link></li>
          <li><Link to="/#work">Work</Link></li>
          <li><Link to="/#contact">Contact</Link></li>
        </ul>
      </nav>
      <hr className="rule" />
    </header>
  )
}

function Footer() {
  return (
    <>
      <hr className="rule thin" />
      <footer id="contact" className="footer">
        <div>
          <span className="lbl">Email</span>
          <a href="mailto:hello@thephifactor.com">hello@thephifactor.com</a>
        </div>
        <div>
          <span className="lbl">Phone</span>
          <a href={PHONE.href}>{PHONE.label}</a>
        </div>
        <div className="right">The Phi Factor</div>
      </footer>
    </>
  )
}

function Home() {
  const landingRef = useLandingReveal()
  const { aboutHeadingRef, aboutTextRef, workHeadingRef, workCardsRef } = useScrollFades()
  return (
    <>
      <section ref={landingRef} className="landing">
        <div className="landing-stage">
          <h1 className="brandmark">
            <span className="line logo-line"><PhiScramble /></span>
            <span className="line name-line"><span className="brand-name">The Phi Factor</span></span>
          </h1>
        </div>
      </section>

      <section id="about" className="intro">
        <h2 ref={aboutHeadingRef} className="eyebrow scroll-fade">Who are we?</h2>
        <p ref={aboutTextRef} className="statement scroll-fade">
          At The Phi Factor, we are a collective of obsessed, passionate
          storytellers dedicated to crafting narratives that bring unique
          stories to life. With your permission, we’d love to tell your story!
        </p>
      </section>

      <section id="work" className="home-work">
        <h2 ref={workHeadingRef} className="bento-title scroll-fade">Work</h2>
        <div ref={workCardsRef} className="cluster home-bento scroll-fade">
          {sections.map((s) => {
            const [col, row] = homeSpots[s.id]
            const count = s.projects.length
            return (
              <Link
                key={s.id}
                to={`/${s.id}`}
                className={`tile cat${s.cover ? '' : ' empty'}`}
                style={{ '--c': col, '--r': row }}
              >
                {s.cover && <PortfolioImage src={s.cover} />}
                <span className="cat-count">{count ? `${pad(count)} ${count === 1 ? 'Project' : 'Projects'}` : 'Coming soon'}</span>
                <strong className="cat-label">{s.title}</strong>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}

function Cluster({ c, project, index, count, number }) {
  const layout = layoutFor(c)
  const portrait = c.type === 'P5'
  return (
    <div className={`cluster${portrait ? ' portrait' : ''}`}>
      {Object.entries(layout).map(([key, [col, row]]) => {
        const style = { '--c': col, '--r': row }
        if (key === 'filler') {
          return (
            <div key={key} className={`tile t-text${index % 2 ? ' alt' : ''}${portrait ? ' wide' : ''}`} style={style}>
              <div className="tt-top"><span>{number}</span></div>
              <div className="tt-main">
                <strong>{project.name}</strong>
                {count > 1 && <span className="tt-part">{index + 1}/{count}</span>}
              </div>
            </div>
          )
        }
        return (
          <figure key={key} className={`tile${key === 'hero' ? ' hero' : ''}`} style={style}>
            <PortfolioImage src={frameSrc(c.base, key)} alt={`${project.name} ${project.kind.toLowerCase()} still`} hero={key === 'hero'} />
          </figure>
        )
      })}
    </div>
  )
}

function Category() {
  const { slug } = useParams()
  const s = sections.find((x) => x.id === slug)
  if (!s) return <Navigate to="/" replace />

  return (
    <section className="bento category">
      <Link className="back" to="/#work">back</Link>
      <h1 className="bento-title">
        {s.title}
      </h1>

      {s.projects.length === 0 && (
        <p className="soon">{s.title} work is on its way. In the meantime, <a href="mailto:hello@thephifactor.com">say hello</a>.</p>
      )}

      {s.projects.length > 1 && (
        <div className="work">
          {s.projects.map((p, i) => (
            <Link className="work-row" to={`#${p.id}`} key={p.id}>
              <span className="n">{pad(i + 1)}</span>
              <span className="t">{p.name}</span>
            </Link>
          ))}
        </div>
      )}

      {s.projects.map((p, pi) => {
        const number = pad(pi + 1)
        return (
          <article className="project" id={p.id} key={p.id}>
            {p.clusters.length === 0 && (
              <div className="cluster placeholder">
                <div className={`tile t-text wide${pi % 2 ? ' alt' : ''}`}>
                  <div className="tt-top"><span>{number}</span></div>
                  <div className="tt-main">
                    <strong>{p.name}</strong>
                    <span className="tt-part">Stills coming soon</span>
                  </div>
                </div>
              </div>
            )}
            {p.clusters.map((c, i) => (
              <Cluster key={c.base} c={c} project={p} index={i} count={p.clusters.length} number={number} />
            ))}
          </article>
        )
      })}
    </section>
  )
}

export default function App() {
  const isHome = useLocation().pathname === '/'
  const scrolled = useScrolledPast(isHome)
  // on home, only the centred logo shows until you scroll
  const revealed = !isHome || scrolled
  return (
    <main className={`page${revealed ? '' : ' at-landing'}`} id="top">
      <img className="watermark" src={phi} alt="" aria-hidden="true" />
      <ScrollManager />
      <Nav isHome={isHome} shown={scrolled} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<Category />} />
      </Routes>
      <Footer />
    </main>
  )
}
