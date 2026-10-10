import { useEffect, useRef, useState } from 'react'
import sources from './imageSources.json'

// Display a region of the untouched original PNG. SVG clips the collage in the
// browser; no canvas export, JPEG conversion, downsampling, or image CDN is used.
export default function PortfolioImage({ src, alt = '', hero = false, eager = false }) {
  const source = sources[src]
  const viewport = useRef(null)
  const [visible, setVisible] = useState(() =>
    eager || (typeof window !== 'undefined' && !('IntersectionObserver' in window)),
  )

  useEffect(() => {
    if (visible || !source) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '400px' })
    observer.observe(viewport.current)
    return () => observer.disconnect()
  }, [source, visible])

  if (!source) return <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} />

  const [x, y, width, height] = source.crop

  return (
    <svg
      ref={viewport}
      className="portfolio-image"
      viewBox={source.crop.join(' ')}
      preserveAspectRatio={hero ? 'xMaxYMid slice' : 'xMidYMid slice'}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      focusable="false"
    >
      {visible && <image href={source.src} width={source.width} height={source.height} />}
      {visible && source.label && (
        <g fill="white" fontFamily="monospace" fontStyle="italic" fontWeight="bold" textAnchor="end" aria-hidden="true">
          <text x={x + width * 0.975} y={y + height * 0.895} fontSize={width * 0.025}>
            / {source.label[0].toUpperCase()}
          </text>
          <text x={x + width * 0.975} y={y + height * 0.955} fontSize={width * 0.012}>
            {source.label[1].toUpperCase()}
          </text>
        </g>
      )}
    </svg>
  )
}
