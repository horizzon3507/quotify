<p align="center">
  <a href="https://web.fluxer.app/oauth2/authorize?client_id=1503854312091857983&scope=bot&permissions=101376"><img src="brand/png/icone-principal-circulo-512.png" width="150"/></a>
</p>

<h1 align="center">quotify</h1>

<p align="center">
  Turn any message into a shareable quote card on <a href="https://fluxer.app">Fluxer</a>.<br/>
  <a href="https://web.fluxer.app/oauth2/authorize?client_id=1503854312091857983&scope=bot&permissions=101376"><strong>Click here to invite the bot to your community</strong></a>
</p>

## How it works

1. Reply to the message you want to quote.
2. Ping **@quotify** in your reply.
3. The bot answers with a rendered quote card: the author's avatar, their
   message with adaptive text sizing, and their tag.

Long text wraps and shrinks to fit, and Japanese text is covered by the
bundled Noto Sans JP font.

## Self-hosting

Requires [Node.js](https://nodejs.org/) 22.13 or newer and a Fluxer bot token.

```bash
git clone https://github.com/horizzon3507/quotify.git
cd quotify
npm install
cp .env.example .env   # fill in your token
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `FLUXER_BOT_TOKEN` | yes | Bot token from the Fluxer developer portal. |
| `FLUXER_API_URL` | no | Discovery URL of a self-hosted Fluxer instance. Leave unset for the official instance. |

On first start the bot downloads Noto Sans JP into `font/` for card
rendering; later starts reuse the cached files.

## Stack

Built on [yuzuha](https://www.npmjs.com/package/yuzuha): gateway events come
from `yuzuha/sdk` (Fluxer.js 3.3.0), and quote cards are composed with
`yuzuha/canvas` and rendered by `@napi-rs/canvas` in a worker process.

## Brand

The quotify mark — two quotes and a smile — lives in [`brand/`](brand) in SVG
and PNG variants (violet `#7B61FF`, night purple `#2B1B5A`, lilac `#EDE9FE`).
Cards carry the same palette and the mark sits in the bottom-right corner.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
