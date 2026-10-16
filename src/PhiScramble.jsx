import { useCallback, useEffect, useRef, useState } from 'react'
import phi from './assets/phi.svg'

// every capital in the Greek alphabet except Phi, which is where we land
const GREEK = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΧΨΩ'.split('')

const shuffled = () => {
  const a = [...GREEK]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// A Phi that flashes through the Greek alphabet and lands on the brand mark.
export default function PhiScramble() {
  // start mid-flash so the logo never shows before the Greek letters (null = resting on the mark)
  const [glyph, setGlyph] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : GREEK[Math.floor(Math.random() * GREEK.length)])
  const timer = useRef(null)
  const running = useRef(false)

  const play = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setGlyph(null)
      return
    }
    if (running.current) return
    running.current = true
    const seq = shuffled()
    let i = 0

    const advance = () => {
      if (i < seq.length) {
        setGlyph(seq[i])
        const progress = i / (seq.length - 1)
        const delay = 52 + Math.round(70 * progress ** 3)
        i += 1
        timer.current = setTimeout(advance, delay)
      } else {
        setGlyph(null)
        timer.current = null
        running.current = false
      }
    }

    timer.current = setTimeout(advance, 0)
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startTimer = reduce ? null : setTimeout(play, 0) // one flourish on load
    return () => {
      clearTimeout(startTimer)
      clearTimeout(timer.current)
      running.current = false
    }
  }, [play])

  return (
    <span
      className="phi"
      role="img"
      aria-label="Phi"
      tabIndex={0}
      onMouseEnter={play}
      onFocus={play}
      onClick={play}
    >
      {glyph ? (
        <span className="phi-glyph" aria-hidden="true">{glyph}</span>
      ) : (
        <img className="phi-mark" src={phi} alt="" />
      )}
    </span>
  )
}
