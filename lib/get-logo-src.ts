import fs from "fs";
import path from "path";

const LOGO_FILENAME = "benedicto-college-logo.png";

export function getLogoSrc(): string {
  const logoPath = path.join(process.cwd(), "public", LOGO_FILENAME);
  const { mtimeMs } = fs.statSync(logoPath);

  return `/${LOGO_FILENAME}?v=${mtimeMs}`;
}
