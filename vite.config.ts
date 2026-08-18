import react from '@vitejs/plugin-react';
import { cheminfoPrerender } from 'react-cheminfo/vite';
import { defineConfig } from 'vite';

import { PAGE_ROUTES, SITE_PAGES } from './src/state/routes.ts';
import { configuredSiteUrl } from './src/state/sitePath.ts';

const servicePort = Number(process.env.PORT ?? 10604);
const devServerPort = Number(process.env.VITE_PORT ?? servicePort + 1);

// The address this build names as its own, for the canonical link, the social
// card and the sitemap. Its path half is the mount the addresses are written
// under; it says nothing about where the assets resolve from — see `base`.
const siteUrl = configuredSiteUrl();

export default defineConfig({
  // The build carries no mount path. Every asset is written relative, so the
  // one `dist` serves the site's own host and a path of a shared one without
  // being rebuilt: the `<base>` the container stamps in at startup is what
  // resolves them, and the page reads its mount back off that.
  base: './',
  plugins: [
    react(),
    cheminfoPrerender({
      site: 'regexp',
      routes: PAGE_ROUTES,
      // Origin and mount path together, so every canonical, social card and
      // sitemap entry is written under the address the deployment answers on.
      origin: siteUrl,
      operatingSystem: 'Any',
      description:
        'Learn regular expressions in a live playground: a guided tutorial, graded exercises checked against test cases, a printable cheatsheet and a glossary.',
      noscript: {
        heading: 'regexp.cheminfo.org — learn regular expressions',
        intro:
          'A guided tutorial, a live playground, graded exercises checked against test cases, a printable cheatsheet and a glossary. The tool needs JavaScript, because the regular expressions run in your browser.',
        // The build is mount-agnostic, so its own addresses are written against
        // the `<base>` the container stamps in rather than from the root of a
        // host this image may not own.
        hrefs: 'relative',
        // A crawl path is a menu: the pages, not the hundred and more exercise
        // addresses the route table also carries.
        routes: SITE_PAGES,
        ecosystem: { taglines: false },
      },
    }),
  ],
  server: {
    port: devServerPort,
    // Fail loudly instead of drifting to the next free port, which would leave
    // the Playwright baseURL and the README disagreeing.
    strictPort: true,
  },
});
