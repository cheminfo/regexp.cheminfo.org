# regexp.cheminfo.org

Interactive pedagogic tool to learn regular expressions, with a guided
tutorial, a live playground, a self-paced exercises module with hints and
instant validation, and a complete cheatsheet.

## Replaces the cheminfo "RegExp explorer" visualizer

This site is the modern, standalone replacement for the legacy "RegExp
explorer" view embedded inside the cheminfo visualizer:

- **Old (legacy visualizer view):**
  <https://www.cheminfo.org/?viewURL=https%3A%2F%2Fcouch.cheminfo.org%2Fcheminfo-public%2F65f84b002399eb79ec0f8bf145113d71%2Fview.json&loadversion=true&fillsearch=RegExp+explorer>
- **New (this site):** <https://regexp.cheminfo.org>

It keeps the live tester and diagram from the original and adds a guided
tutorial, an exercise module with hints and instant validation, and a
printable cheatsheet — all built to the cheminfo
[ensure-string standards](https://github.com/cheminfo/ensure-string).

## Features

- **Tutorial** — 8 guided steps that walk the student through literals,
  escaping, character classes, shortcuts, quantifiers, anchors, groups and
  look-around. Each step preloads a regex and a sample text the student can
  edit live.
- **Playground** — type any regex, toggle all 6 flags, paste any text and
  see matches highlighted in real time. Optional replacement preview.
- **Exercises** — 11 increasing-difficulty challenges. Each exercise has
  test cases that must all pass for the regex to be accepted. Students can
  reveal hints one at a time and toggle a live railroad diagram of the regex
  they are writing. Progress is stored in `localStorage`.
- **Reference** — printable cheatsheet covering the basics, character
  classes, quantifiers, anchors, groups, look-around, flags, replacement
  specials and special characters.

## Local development

```sh
npm install
npm run dev
```

Then open the URL printed by Vite (typically `http://localhost:5173`).
The Vite dev server picks its own port; `PORT` from `.env` is only read by
the Docker container (the static-web-server inside it).

## Tests, lint and type checks

```sh
npm run test
```

This runs unit tests with coverage, the TypeScript checker, ESLint and
Prettier.

## Production build

```sh
npm run build
npm run preview
```

The static site is emitted to `dist/`.

## Docker deployment

Three deployment modes are shipped as `compose.example.*.yaml`. Each one
exposes both `image:` and `build: .`, so you can either pull the released
image (`docker compose pull && docker compose up -d`) or build from the
current checkout (`docker compose up -d --build`).

Always start with:

```sh
cp .env.example .env
# edit .env if needed (PORT for host-port mode, TUNNEL_TOKEN for cloudflared)
```

### Port mode (`compose.example.yaml`)

Exposes the static site on a host port. The container always serves on
port 80; the host port is configured via `PORT` in `.env` (default 8080).

```sh
cp compose.example.yaml compose.yaml
docker compose up -d
```

### Cloudflare Tunnel (`compose.example.cloudflared.yaml`)

Public HTTPS via Cloudflare Tunnel, by default published at
`regexp.lactame.com`. No host port is exposed.

1. In the Cloudflare dashboard (https://dash.cloudflare.com):
   *Networking → Tunnels → Create a tunnel → Cloudflared connector*.
2. Copy the connector token into `.env` as `TUNNEL_TOKEN=...`.
3. Open the new tunnel, go to the **Published applications** tab and add
   an application with `Service = HTTP`, URL =
   `regexp-cheminfo-org:80`, hostname `regexp.lactame.com` (or any host
   you chose in Cloudflare).
4. Deploy:

```sh
cp compose.example.cloudflared.yaml compose.yaml
docker compose up -d
```

### Traefik (`compose.example.traefik.yaml`)

For deployment behind an existing Traefik instance on
`regexp.cheminfo.org`. Requires the host to already run Traefik on an
external Docker network named `traefik` (with a `websecure` entrypoint
and a `letsencrypt` cert resolver). Adjust the `Host(...)` label inside
the compose file if you want a different hostname.

```sh
cp compose.example.traefik.yaml compose.yaml
docker compose up -d
```

## Environment variables

| Name           | Description                                              |
| -------------- | -------------------------------------------------------- |
| `PORT`         | Host port to publish (port mode only). Defaults to 8080. |
| `TUNNEL_TOKEN` | Cloudflare Tunnel token (cloudflared deployment only).   |

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md). The file is managed automatically by
release-please based on Conventional Commits.
