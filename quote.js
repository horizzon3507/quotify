import { createCanvas } from "yuzuha/canvas";
import { createCanvas as createMeasureCanvas, GlobalFonts } from "@napi-rs/canvas";
import { loadFonts } from "./font.js";

const CANVAS_W = 1200;
const CANVAS_H = 630;
const AVATAR_W = 500;
const FADE_START = 200;
const TEXT_X = 540;
const TEXT_MAX_W = CANVAS_W - TEXT_X - 50;
const TEXT_ZONE_H = CANVAS_H - 80;
const ATTR_ZONE = 102;
const ATTR_GAP = 14;
const LINE_HEIGHT = 1.55;
const FONT = "NotoSansJP";

let fonts = {};
let measureCtx;

const graphemes = (value) => [
  ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value),
].map((item) => item.segment);

export async function quoteInit() {
  fonts = await loadFonts();
  for (const [family, entry] of Object.entries(fonts)) {
    GlobalFonts.register(Buffer.from(entry.regular), family);
  }
  measureCtx = createMeasureCanvas(1, 1).getContext("2d");
}

function wrapLines(text, fontSize) {
  measureCtx.font = `400 ${fontSize}px "${FONT}"`;
  const measure = (line) => measureCtx.measureText(line).width;
  const lines = [];
  for (const raw of text.split("\n")) {
    const words = raw.split(/(\s+)/u).filter(Boolean);
    let line = "";
    for (const word of words) {
      const combined = line + word;
      if (measure(combined) <= TEXT_MAX_W || !line) {
        line = combined;
      } else {
        lines.push(line.trimEnd());
        line = word.trimStart();
      }
      if (measure(line) > TEXT_MAX_W) {
        let part = "";
        for (const unit of graphemes(line)) {
          if (part && measure(part + unit) > TEXT_MAX_W) {
            lines.push(part);
            part = unit;
          } else {
            part += unit;
          }
        }
        line = part;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

function baseFontSize(len) {
  if (len < 30) return 64;
  if (len < 60) return 52;
  if (len < 120) return 40;
  if (len < 200) return 32;
  return 26;
}

function layout(text) {
  let fontSize = baseFontSize(text.length);
  let lines = wrapLines(text, fontSize);
  while (
    fontSize > 20 &&
    lines.length * fontSize * LINE_HEIGHT + ATTR_ZONE > TEXT_ZONE_H
  ) {
    fontSize = Math.max(20, fontSize - 4);
    lines = wrapLines(text, fontSize);
  }
  return { fontSize, lines };
}

function buildCard({ text, tag, botTag, avatar, http, signal }) {
  const card = createCanvas(CANVAS_W, CANVAS_H, {
    background: "#000",
    fonts,
    http,
    signal,
  });

  if (avatar) {
    card.image(avatar, {
      x: 0,
      y: 0,
      width: AVATAR_W,
      height: CANVAS_H,
      fit: "cover",
    });
  }

  card.rect({
    x: FADE_START,
    y: 0,
    width: AVATAR_W - FADE_START,
    height: CANVAS_H,
    fill: {
      type: "linear",
      x0: FADE_START,
      y0: 0,
      x1: AVATAR_W,
      y1: 0,
      stops: [
        { offset: 0, color: "rgba(0,0,0,0)" },
        { offset: 1, color: "rgba(0,0,0,1)" },
      ],
    },
  });

  const { fontSize, lines } = layout(text);
  const blockH = lines.length * fontSize * LINE_HEIGHT + ATTR_ZONE;
  const textY = Math.max(30, (CANVAS_H - blockH) / 2);
  const attrY = textY + lines.length * fontSize * LINE_HEIGHT + ATTR_GAP;
  const maxLines = Math.floor(
    (TEXT_ZONE_H - ATTR_ZONE) / (20 * LINE_HEIGHT),
  );

  card.text(text, {
    x: TEXT_X,
    y: textY,
    maxWidth: TEXT_MAX_W,
    fontSize,
    minFontSize: 20,
    family: FONT,
    color: "#fff",
    align: "center",
    wrap: "word",
    maxLines,
    lineHeight: LINE_HEIGHT,
    overflow: "ellipsis",
  });

  card.text(`- ${tag}`, {
    x: TEXT_X,
    y: attrY,
    maxWidth: TEXT_MAX_W,
    fontSize: 28,
    family: FONT,
    color: "#fff",
    align: "center",
    wrap: "none",
    overflow: "ellipsis",
  });

  card.text(botTag, {
    x: CANVAS_W - 20 - 480,
    y: CANVAS_H - 16 - 16,
    maxWidth: 480,
    fontSize: 16,
    family: FONT,
    color: "rgba(100,100,100,0.75)",
    align: "right",
    wrap: "none",
    overflow: "ellipsis",
  });

  return card;
}

const RETRYABLE = new Set(["CANVAS_INPUT", "CANVAS_PROCESS"]);

export async function generateQuote({
  text,
  tag,
  avatarUrl,
  botTag = "quotify",
  http,
  signal,
}) {
  let avatar;
  if (avatarUrl && http) {
    try {
      const res = await http.requestBytes({ method: "GET", url: avatarUrl });
      if (res.ok) avatar = res.body;
    } catch {}
  }

  const opts = { text, tag, botTag, avatar, http, signal };
  try {
    return await buildCard(opts).render({ format: "png" });
  } catch (err) {
    if (!avatar || !RETRYABLE.has(err?.code)) throw err;
    return buildCard({ ...opts, avatar: undefined }).render({ format: "png" });
  }
}
