import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sections, layoutFor, frameSrc } from '../src/projects.js'

const root = new URL('../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root))
const images = JSON.parse(read('src/imageSources.json'))
const provenance = JSON.parse(read('asset-provenance.json'))
const originals = new Map(provenance.files.map((file) => [file.path, file]))

const expected = new Set(sections.flatMap((section) => [
  ...(section.cover ? [section.cover] : []),
  ...section.projects.flatMap((project) => project.clusters.flatMap((cluster) =>
    Object.keys(layoutFor(cluster)).filter((key) => key !== 'filler')
      .map((key) => frameSrc(cluster.base, key)),
  )),
]))

for (const key of expected) {
  const image = images[key]
  assert(image, `Missing original source for ${key}`)
  const original = originals.get(image.src)
  assert(original, `Missing provenance for ${image.src}`)
  assert.equal(image.width, original.width)
  assert.equal(image.height, original.height)
  assert.equal(image.crop.length, 4)
  assert(image.crop.every(Number.isFinite), `Invalid crop for ${key}`)
  const [x, y, width, height] = image.crop
  assert(x >= 0 && y >= 0 && width > 0 && height > 0, `Invalid crop for ${key}`)
  assert(x + width <= image.width && y + height <= image.height, `Crop outside source for ${key}`)
}

for (const file of provenance.files) {
  assert(file.path.startsWith('/work/originals/') && !file.path.includes('..'))
  for (const directory of ['public', 'dist']) {
    const path = `${directory}${file.path}`
    const hash = createHash('sha256').update(read(path)).digest('hex')
    assert.equal(hash, file.sha256, `Original image bytes changed: ${fileURLToPath(new URL(path, root))}`)
  }
}

console.log(`Verified ${expected.size} portfolio images; ${originals.size} original files preserved byte-for-byte in public/ and dist/.`)
