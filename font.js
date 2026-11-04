import fs from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const font_table = [
  {
    name: "NotoSansJP",
    url: "https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf",
  },
];

export async function fontCheck() {
  fs.mkdirSync("font/", { recursive: true });
  console.log("[ FONT ] check...");

  for (const font of font_table) {
    const path = `font/${font.name}.ttf`;
    if (!fs.existsSync(path)) {
      console.log(`[ FONT ] Downloading ${font.name}`);
      const f = await fetch(font.url);
      if (!f.ok) {
        console.error(`[ FONT ] Failed ${font.name}`);
        continue;
      }

      await pipeline(Readable.fromWeb(f.body), fs.createWriteStream(path));
      console.log(`[ FONT ] Done`);
    }
  }
}

export async function loadFonts() {
  const fonts = {};
  for (const font of font_table) {
    const path = `font/${font.name}.ttf`;
    if (!fs.existsSync(path)) continue;
    fonts[font.name] = {
      regular: new Uint8Array(await fs.promises.readFile(path)),
    };
  }
  return fonts;
}
