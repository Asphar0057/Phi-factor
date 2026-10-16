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

// adds `in` once the element scrolls into view
function useReveal() {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return setShown(true)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true)
        io.disconnect()
      }
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, shown]
}

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
    const check = () => setPast(window.scrollY > window.innerHeight * 0.5)
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

function Nav({ isHome, shown }) {
  return (
    <header
      className={`site-header${isHome ? ' is-home' : ''}${isHome && !shown ? ' is-hidden' : ''}`}
      inert={isHome && !shown ? true : undefined}
    >
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" to="/"><img src={phi} alt="" />the phi factor</Link>
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
  const [aboutRef, aboutIn] = useReveal()
  return (
    <>
      <section className="landing">
        <h1 className="brandmark">
          <span className="line"><PhiScramble /></span>
          <span className="sr-only">the phi factor</span>
        </h1>
      </section>

      <section id="about" ref={aboutRef} className={`intro${aboutIn ? ' in' : ''}`}>
        <h2 className="eyebrow">Who are we?</h2>
        <p className="statement">
          At The Phi Factor, we are a collective of obsessed, passionate
          storytellers dedicated to crafting narratives that bring unique
          stories to life. With your permission, we’d love to tell your story!
        </p>
      </section>

      <section id="work" className="home-work">
        <h2 className="bento-title">Work</h2>
        <div className="cluster home-bento">
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
