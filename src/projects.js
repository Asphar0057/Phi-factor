// Layout templates: tile key -> [grid-column, grid-row] on a 12-col grid.
// `flip` mirrors the cluster left/right.
const layouts = {
  // hero + big + 2 small (landscape collage)
  L4: {
    normal: { hero: ['1 / 9', '1 / 3'], s1: ['9 / 13', '1 / 2'], s2: ['9 / 13', '2 / 3'], big: ['5 / 13', '3 / 5'], filler: ['1 / 5', '3 / 5'] },
    flip:   { hero: ['5 / 13', '1 / 3'], s1: ['1 / 5', '1 / 2'], s2: ['1 / 5', '2 / 3'], big: ['1 / 9', '3 / 5'], filler: ['9 / 13', '3 / 5'] },
  },
  // hero + 2 halves
  K3: {
    normal: { hero: ['1 / 9', '1 / 3'], filler: ['9 / 13', '1 / 3'], h1: ['1 / 7', '3 / 5'], h2: ['7 / 13', '3 / 5'] },
    flip:   { hero: ['5 / 13', '1 / 3'], filler: ['1 / 5', '1 / 3'], h1: ['1 / 7', '3 / 5'], h2: ['7 / 13', '3 / 5'] },
  },
  // hero + 3 stacked + 2 lower
  H6: {
    normal: { hero: ['1 / 9', '1 / 4'], l1: ['9 / 13', '1 / 2'], l2: ['9 / 13', '2 / 3'], l3: ['9 / 13', '3 / 4'], lowL: ['1 / 6', '4 / 6'], lowR: ['6 / 10', '4 / 6'], filler: ['10 / 13', '4 / 6'] },
    flip:   { hero: ['5 / 13', '1 / 4'], l1: ['1 / 5', '1 / 2'], l2: ['1 / 5', '2 / 3'], l3: ['1 / 5', '3 / 4'], lowL: ['3 / 8', '4 / 6'], lowR: ['8 / 13', '4 / 6'], filler: ['1 / 3', '4 / 6'] },
  },
  // tall portrait hero + 4 portraits (tall rows)
  P5: {
    normal: { e: ['1 / 5', '1 / 3'], a: ['5 / 9', '1 / 2'], b: ['9 / 13', '1 / 2'], c: ['5 / 9', '2 / 3'], d: ['9 / 13', '2 / 3'], filler: ['1 / 13', '3 / 4'] },
    flip:   { e: ['9 / 13', '1 / 3'], a: ['1 / 5', '1 / 2'], b: ['5 / 9', '1 / 2'], c: ['1 / 5', '2 / 3'], d: ['5 / 9', '2 / 3'], filler: ['1 / 13', '3 / 4'] },
  },
}

const cluster = (type, base, flip = false) => ({ type, base, flip })

export const sections = [
  {
    id: 'music-videos',
    title: 'Music Videos',
    cover: '/work/aandhi-1-hero.jpg',
    projects: [
      { id: 'aandhi', name: 'Aandhi', kind: 'Music Video', clusters: [cluster('L4', 'aandhi-1'), cluster('L4', 'aandhi-2', true)] },
      { id: 'heguruve', name: 'Heguruve', kind: 'Music Video', clusters: [cluster('H6', 'heguruve')] },
      { id: 'kamagaari', name: 'Kamagaari', kind: 'Music Video', clusters: [cluster('K3', 'kamagaari-1'), cluster('K3', 'kamagaari-2', true)] },
      { id: 'meghave', name: 'Meghave', kind: 'Music Video', clusters: [cluster('L4', 'meghave-1'), cluster('L4', 'meghave-2', true)] },
    ],
  },
  {
    id: 'films',
    title: 'Films',
    cover: '/work/chittha-2-hero.jpg',
    projects: [
      { id: 'chittha', name: 'Chittha', kind: 'Indie Film', clusters: [cluster('L4', 'chittha-1'), cluster('L4', 'chittha-2', true)] },
    ],
  },
  {
    id: 'advertising',
    title: 'Advertising',
    cover: '/work/coco-1-a.jpg',
    projects: [
      { id: 'coco-matcha-club', name: 'Coco Matcha Club', kind: 'Advertisement', clusters: [cluster('P5', 'coco-1'), cluster('P5', 'coco-2', true)] },
      { id: 'cut-and-style-salons', name: 'Cut & Style Salons', kind: 'Advertisement', clusters: [cluster('P5', 'cs-1'), cluster('P5', 'cs-2', true)] },
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate',
    cover: null,
    projects: [],
  },
]

export const layoutFor = (c) => layouts[c.type][c.flip ? 'flip' : 'normal']
export const hasFiller = (c) => 'filler' in layouts[c.type].normal
export const frameSrc = (base, key) => `/work/${base}-${key}.jpg`
