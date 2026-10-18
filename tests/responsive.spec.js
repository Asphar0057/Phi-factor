import { test, expect } from '@playwright/test'
import { sections } from '../src/projects.js'

const routes = ['/', ...sections.map(section => `/${section.id}`)]

async function screenshot(page, testInfo, name, fullPage = false) {
  if (fullPage) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  }
  const path = testInfo.outputPath(`${name}.png`)
  await page.screenshot({ path, fullPage, animations: 'disabled', scale: 'css' })
  await testInfo.attach(name, { path, contentType: 'image/png' })
}

async function layoutErrors(page) {
  return page.evaluate(() => {
    const errors = []
    const width = document.documentElement.clientWidth
    const label = el => `${el.className}: ${el.textContent.trim().slice(0, 60)}`
    if (document.documentElement.scrollWidth > innerWidth + 1) errors.push('document overflow')
    for (const el of document.querySelectorAll('h1,h2,.tile,.footer,.nav,.work-row')) {
      const r = el.getBoundingClientRect()
      if (r.left < -1 || r.right > width + 1) errors.push(`outside viewport ${label(el)}`)
    }
    // The landing name intentionally sits below its logo's absolute-positioned box.
    for (const el of document.querySelectorAll('.t-text,.tt-main,h1:not(.brandmark),h2,.work-row')) {
      if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 3) errors.push(`clipped ${label(el)}`)
    }
    return errors
  })
}

for (const route of routes) {
  test(`${route} layout, images, headings and footer`, async ({ page }, testInfo) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`)
    })
    await page.goto(route)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('h1')).toHaveCount(1)
    expect(await layoutErrors(page)).toEqual([])
    await screenshot(page, testInfo, 'top')

    // Visit every image, triggering and verifying lazy loading throughout the page.
    const images = page.locator('.tile .portfolio-image')
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded()
      await expect(image.locator('image')).toHaveCount(1)
    }
    const failedImages = await page.evaluate(async () => {
      const urls = [...new Set([...document.querySelectorAll('.tile svg image')].map(image => image.getAttribute('href')))]
      const failed = []
      // Decode one original at a time to keep mobile test memory bounded.
      for (const url of urls) {
        const image = new Image()
        image.src = url
        try { await image.decode() } catch { failed.push(url) }
      }
      return failed
    })
    expect(failedImages).toEqual([])
    expect(await layoutErrors(page)).toEqual([])
    await page.locator('.footer').scrollIntoViewIfNeeded()
    await expect(page.locator('.footer a[href="mailto:hello@thephifactor.com"]')).toBeVisible()
    await expect(page.locator('.footer a[href="tel:+918088219356"]')).toBeVisible()
    await screenshot(page, testInfo, 'footer')
    await screenshot(page, testInfo, 'full-page', true)
    expect(errors).toEqual([])
  })
}

test('navigation, project anchors, back link and menu keyboard behavior', async ({ page }, testInfo) => {
  const activate = locator => testInfo.project.use.hasTouch ? locator.tap() : locator.click()
  await page.goto('/corporate')
  const compact = page.viewportSize().width < 1024
  if (compact) {
    await activate(page.locator('summary'))
    await expect(page.locator('details')).toHaveAttribute('open', '')
    await screenshot(page, testInfo, 'menu-open')
    const menuErrors = await page.evaluate(() => {
      const errors = []
      const panel = document.querySelector('.nav-panel').getBoundingClientRect()
      if (panel.left < -1 || panel.right > innerWidth + 1 || panel.bottom > innerHeight + 1) errors.push('menu outside viewport')
      for (const el of document.querySelectorAll('.nav-panel a,summary,.brand')) {
        const r = el.getBoundingClientRect()
        if (r.width < 43.9 || r.height < 43.9) errors.push(`small tap target ${el.textContent}`)
      }
      return errors
    })
    expect(menuErrors).toEqual([])
    await page.keyboard.press('Escape')
    await expect(page.locator('details')).not.toHaveAttribute('open')
    await expect(page.locator('summary')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('details')).toHaveAttribute('open', '')
  }
  for (const section of sections) {
    if (compact && !(await page.locator('details').getAttribute('open') === '')) await activate(page.locator('summary'))
    await activate(page.locator('.service-index').getByRole('link', { name: section.title, exact: true }))
    await expect(page).toHaveURL(new RegExp(`/${section.id}$`))
    await expect(page.locator('h1')).toHaveText(section.title)
    if (compact) await expect(page.locator('details')).not.toHaveAttribute('open')
  }
  await page.goto('/corporate')
  await activate(page.getByRole('link', { name: '02 Taral – Premium Lecture Series' }))
  await expect(page).toHaveURL(/#taral$/)
  await expect(page.locator('#taral')).toBeInViewport()
  await screenshot(page, testInfo, 'long-project-title')
  await activate(page.locator('.back'))
  await expect(page).toHaveURL(/\/#work$/)
  await expect(page.locator('#work h2')).toBeInViewport()
  await screenshot(page, testInfo, 'home-work')
  for (const name of ['About', 'Work', 'Contact']) {
    if (compact) await activate(page.locator('summary'))
    await activate(page.locator('.nav-links').getByRole('link', { name, exact: true }))
    await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`))
    const target = page.locator(`#${name.toLowerCase()}`)
    await expect(target).toBeInViewport()
    if (compact) await expect(page.locator('details')).not.toHaveAttribute('open')
  }
})

test('normal motion, orientation changes and focus visibility', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => !document.querySelector('.phi-glyph'))
  await screenshot(page, testInfo, 'landing-motion')
  await page.locator('#about').scrollIntoViewIfNeeded()
  await expect(page.locator('#about h2')).toHaveCSS('opacity', '1')
  await expect(page.locator('.statement')).toHaveCSS('opacity', '1')
  await screenshot(page, testInfo, 'about-motion')
  await page.goto('/corporate')
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.locator('summary').click()
  await page.setViewportSize({ width: 1180, height: 820 })
  await expect(page.locator('summary')).toHaveCount(0)
  await expect(page.locator('.service-index')).toBeVisible()
  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(page.locator('details')).not.toHaveAttribute('open')
  expect(await layoutErrors(page)).toEqual([])
})
