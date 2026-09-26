import { useEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import './App.css'
import phi from './assets/phi.svg'
import PhiScramble from './PhiScramble'
import PortfolioImage from './PortfolioImage'
import { sections, layoutFor, frameSrc } from './projects'

const pad = (n) => String(n).padStart(2, '0')

// where each category sits in the home bento
const homeSpots = {
  'music-videos': ['1 / 8', '1 / 4'],
  films: ['8 / 13', '1 / 3'],
  advertising: ['8 / 13', '3 / 4'],
  corporate: ['1 / 13', '4 / 5'],
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

function Nav() {
  const isHome = useLocation().pathname === '/'
  return (
    <>
      <nav className="nav">
        {isHome ? (
          <span className="tagline">Films . Advertising . Music Video . Corporate</span>
        ) : (
          <Link className="brand" to="/"><img src={phi} alt="" />The Phi Factor</Link>
        )}
        <ul>
          <li><Link to="/#about">About</Link></li>
          <li><Link to="/#work">Work</Link></li>
          <li><Link to="/#contact">Contact</Link></li>
        </ul>
      </nav>
      <hr className="rule" />
    </>
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
          <a href="tel:+919535920895">+91 9535920895</a> / <a href="tel:+918618953698">+91 8618953698</a>
        </div>
        <div className="right">The Phi Factor</div>
      </footer>
    </>
  )
}

function Home() {
  return (
    <>
      <section id="about" className="intro">
        <p className="eyebrow">Who are we?</p>
        <h1 className="hero-title">
          <span className="line"><span>The</span></span>
          <span className="line"><PhiScramble /></span>
          <span className="line"><span>Factor</span></span>
        </h1>
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
              <div className="tt-top"><span>{project.kind}</span><span>{number}</span></div>
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
      <Link className="back" to="/#work">All work</Link>
      <h1 className="bento-title">
        {s.title}
      </h1>

      {s.projects.length === 0 && (
        <p className="soon">Corporate work is on its way. In the meantime, <a href="mailto:hello@thephifactor.com">say hello</a>.</p>
      )}

      {s.projects.length > 1 && (
        <div className="work">
          {s.projects.map((p, i) => (
            <Link className="work-row" to={`#${p.id}`} key={p.id}>
              <span className="n">{pad(i + 1)}</span>
              <span className="t">{p.name}</span>
              <span className="k">{p.kind}</span>
            </Link>
          ))}
        </div>
      )}

      {s.projects.map((p, pi) => {
        const number = pad(pi + 1)
        return (
          <article className="project" id={p.id} key={p.id}>
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
  return (
    <main className="page" id="top">
      <img className="watermark" src={phi} alt="" aria-hidden="true" />
      <ScrollManager />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<Category />} />
      </Routes>
      <Footer />
    </main>
  )
}
