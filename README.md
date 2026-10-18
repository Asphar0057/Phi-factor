# React + Vite

## Portfolio image quality

The portfolio serves untouched original assets without added lossy compression or downsampling. `npm run build` also checks original-file hashes in the production output. See [image quality and source limitations](docs/image-quality.md).

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Responsive browser checks

Install the test browsers once, then run the suite:

```sh
npx playwright install chromium webkit
npm run test:responsive
npx playwright show-report
```

The suite covers all five routes across ten viewports: 320px phones, iPhone SE,
393px iPhone, Android, phone landscape, iPad Mini, iPad Air, iPad landscape,
1440px desktop, and 1920px desktop. iPhone and iPad cases run in WebKit;
Android and desktop cases run in Chromium.

Checks include overflow, heading and project-title bounds, every lazy-loaded
portfolio image, touch target sizes, touch navigation, project anchors, the back
link, email and telephone link destinations, Escape/Enter menu behavior,
orientation changes, and normal/reduced motion. Screenshot attachments include
page tops, footers, full pages, open menus, long project titles, and home sections.
Generated reports and screenshots are in `playwright-report/` and `test-results/`
(both ignored by Git).

These are browser emulations, not tests on physical iPhones, Android phones, or
iPads. Native browser chrome, real device performance, and notch insets still need
physical-device confirmation. Original portfolio image bytes remain unchanged;
see the image-quality notes above.
