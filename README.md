# regexp.cheminfo.org

Interactive pedagogic tool to learn regular expressions — guided
tutorial, live playground, self-paced exercises with hints and instant
validation, and a complete cheatsheet.

<p align="center">
  This website is provided by Luc Patiny from
  <a href="https://www.epfl.ch">
    <img src="./public/epfl-logo.svg" alt="EPFL" height="32" align="middle" />
  </a>
</p>

Live site: <https://regexp.cheminfo.org>

## Replaces the cheminfo "RegExp explorer" visualizer

This site is the modern, standalone replacement for the legacy "RegExp
explorer" view embedded inside the cheminfo visualizer:

- **Old (legacy visualizer view):**
  <https://www.cheminfo.org/?viewURL=https%3A%2F%2Fcouch.cheminfo.org%2Fcheminfo-public%2F65f84b002399eb79ec0f8bf145113d71%2Fview.json&loadversion=true&fillsearch=RegExp+explorer>
- **New (this site):** <https://regexp.cheminfo.org>

It keeps the live tester and diagram from the original and adds a
guided tutorial, an exercise module with hints and instant validation,
and a printable cheatsheet — all built to the cheminfo
[ensure-string standards](https://github.com/cheminfo/ensure-string).

## Features

- **🎓 Tutorial** — 8 guided steps walking the student through
  literals, escaping, character classes, shortcuts, quantifiers,
  anchors, groups and look-around. Each step preloads a regex and a
  sample text the student can edit live.
- **🧪 Playground** — type any regex, toggle all six flags
  (`g`, `i`, `m`, `s`, `u`, `y`), paste any text and see matches
  highlighted in real time. Optional replacement preview with `$&`
  and `$1` syntax.
- **🏆 Exercises** — 11 increasing-difficulty challenges, from "match
  the word `hello`" to "find a duplicate word with a backreference".
  Each exercise has test cases that must all pass for the regex to be
  accepted. Students can reveal hints one at a time, toggle a live
  railroad diagram of the regex they are writing, or peek at the
  sample solution. Progress is persisted in `localStorage`.
- **📚 Reference** — printable cheatsheet covering the basics,
  character classes, quantifiers, anchors, groups, look-around, flags,
  replacement specials and special characters.

## Stack

- React 18 + TypeScript 6 + [Vite 8](https://vitejs.dev)
- [BlueprintJS](https://blueprintjs.com/) for UI components
- Custom-built railroad-style regex diagram (no external regex engine)
- Vitest for unit tests, ESLint 9 + Prettier for linting
- Static-only deployment — no backend, no API calls

## Local development

```sh
npm install
npm run dev
```

Then open `http://localhost:10802`. The dev server port is `PORT + 1`,
so the single derived `PORT` (10801, from the project creation date)
drives both the container and the dev server. Override with `VITE_PORT`.

## Tests, lint and type checks

```sh
npm run test       # vitest + tsc + eslint + prettier
npm run test-e2e   # Playwright (Chromium) end-to-end suite
```

`npm run test` runs the fast gate: unit tests with coverage, the
TypeScript checker, ESLint and Prettier.

`npm run test-e2e` boots the Vite dev server and exercises the live UI
(tutorial, playground, exercises with `localStorage` persistence,
cheatsheet, glossary, about, header links, hash routing). First-time
setup requires `npx playwright install --with-deps chromium`. Use
`npm run test-e2e-ui` for the interactive Playwright runner.

## Production build

```sh
npm run build
npm run preview
```

The static site is emitted to `dist/`.

## Docker deployment

Three deployment modes are shipped, one compose file each. Every one
exposes both `image:` and `build: .`, so you can either pull the released
image (`docker compose pull && docker compose up -d`) or build from the
current checkout (`docker compose up -d --build`).

```sh
cp .env.example .env
# uncomment exactly one COMPOSE_FILE line, then:
docker compose up -d
```

With no `COMPOSE_FILE` uncommented, `docker compose` uses `compose.yaml`.

### Port mode (`compose.yaml`)

Publishes the static site on `PORT` (default 10801), which is also the
port the container serves on.

### Traefik (`compose.traefik.yaml`)

For an existing Traefik instance serving `regexp.cheminfo.org`. Requires
an external Docker network named `traefik` with a `websecure` entrypoint
and a `letsencrypt` cert resolver. No host port is published. Adjust the
`Host(...)` label for a different hostname.

### Cloudflare Tunnel (`compose.cloudflared.yaml`)

Public HTTPS via Cloudflare Tunnel, by default at `regexp.lactame.com`.
No host port is published.

1. Cloudflare dashboard: _Networking → Tunnels → Create a tunnel →
   Cloudflared connector_.
2. Copy the connector token into `.env` as `TUNNEL_TOKEN=...`.
3. Open the tunnel, **Published applications** tab, add an application
   with `Service = HTTP`, URL `regexp-cheminfo-org:10801`, hostname
   `regexp.lactame.com`.

## Deploy and rollback

Never deploy with `git pull && docker compose up -d --build`: the build
overwrites the running tag in place and `git pull` moves the source at the
same time, so there is nothing left to go back to. Use `./deploy.sh`.

```sh
./deploy.sh                                  # pull, build, start, health-check, auto-revert on failure
./deploy.sh rollback                         # back to the previous known-good deploy
./deploy.sh rollback 20260801-1332-a1b2c3d   # back to a specific one
./deploy.sh list                             # what is running, and what can be rolled back to
./deploy.sh prune                            # drop images older than the last 10 deploys
```

Each deploy builds an immutable tag `<utc date>-<utc hhmm>-<short sha>`,
writes it to `IMAGE_TAG` in `.env`, and appends `date tag commit` to
`.deploy/history`. The build runs before `up`, so a failed build never
touches the running stack; the new container is then probed on `/` from
inside the container (the traefik and cloudflared modes publish no host
port) and automatically reverted if it does not answer.

A rollback rewrites `IMAGE_TAG` and checks out the recorded commit, so the
image and the compose file, Dockerfile and build that go with it move back
together. It needs no build and no network. The checkout is left on a
detached HEAD on purpose — `deploy.sh` refuses to deploy from there until
you `git checkout main`.

The last 10 images are kept; older ones are removed after each successful
deploy. Raise `KEEP` in `deploy.sh` to keep a longer history.

## Environment variables

| Name           | Description                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `COMPOSE_FILE` | Deployment mode: `compose.yaml` (default), `compose.traefik.yaml`, `compose.cloudflared.yaml`. |
| `PORT`         | Port the container serves on, and publishes in port mode. Defaults to 10801.                   |
| `IMAGE_NAME`   | Image selected by every compose file. Defaults to `ghcr.io/cheminfo/regexp.cheminfo.org`.      |
| `IMAGE_TAG`    | Tag deployed. Rewritten by `./deploy.sh` — do not edit by hand.                                |
| `TUNNEL_TOKEN` | Cloudflare Tunnel token (cloudflared deployment only).                                         |

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md). The file is managed automatically
by release-please based on Conventional Commits.

## License

[MIT](./LICENSE)
