# Changelog

We follow [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/). quotify is a single bot surface.

<details>
<summary>To see more about versioning, expand this.</summary>

Every version string starts with `v` (required), e.g. `v0.2.0-stable`, `v0.1.0-stable`.

Here the installable surface is **Bot** (`quotify` / `miq-bot`). Other apps swap in their own names the same way — e.g. **CLI**, **GNOME**, **Web** — whatever you actually ship.

| Part | What you install | Example |
| --- | --- | --- |
| **Bot** | the `quotify` service you run with `npm start` | `v0.1.0-stable` |

With one surface there is no `m` in the tag and no per-surface sections — just the version notes.

Each release heading is the version and date (`## v0.1.0-stable · 04/11/2026`); under it, a short summary ends with a plain sentence like: "This version was made for Bot with a stable release channel on 04/11/2026 (v0.1.0-stable)."

### What the channel suffix means

| Suffix | In plain words |
| --- | --- |
| **-alpha** | Very early. Expect missing pieces and lots of bugs. |
| **-beta** | Mostly there, but still rough. Fine to try; not the "official" install. |
| **-stable** | Ready for daily use. This is what we put on GitHub Releases. |

We only call something **stable** when we mean it.

</details>

## v0.1.0-stable · 04/11/2026

First Hory-tracked cut: the quote-card bot rebuilt on the yuzuha framework. This version was made for Bot with a stable release channel on 04/11/2026 (v0.1.0-stable).

- Reply-to-quote flow: ping the bot on a reply and it answers with a 1200x630 PNG quote card.
- Card composition moved to `yuzuha/canvas`: avatar cover panel, fade-to-black gradient, adaptive font sizing, author attribution and bot watermark.
- Text wraps by word and shrinks to fit the card, with grapheme-safe breaking for long unbroken strings and Japanese coverage through a downloaded Noto Sans JP font.
- Gateway wiring through `yuzuha` and `yuzuha/sdk` (`bot.on`, `bot.once`, `bot.login`), replacing the direct `@fluxerjs/core` bootstrap.
- Self-hosted Fluxer instances still supported through `FLUXER_API_URL` discovery (`Client.fromDiscovery`), with avatar fetch allowed to private hosts.
- In-memory store and disabled scheduler; the bot writes no state files.
- Graceful shutdown on SIGINT/SIGTERM through `bot.destroy()`.
