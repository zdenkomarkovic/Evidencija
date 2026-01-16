// scripts/convert-images.js
import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputDir = "public/images";
const outputDir = "public/optimized";

async function processImage(filePath, relativePath) {
  const outputPathWebp = path.join(
    outputDir,
    relativePath.replace(/\.[^/.]+$/, ".webp")
  );

  // Kreiraj folder ako ne postoji
  fs.mkdirSync(path.dirname(outputPathWebp), { recursive: true });

  // WebP
  await sharp(filePath)
    .toFormat("webp", { quality: 75 })
    .toFile(outputPathWebp);

  console.log(`✔ Converted: ${relativePath}`);
}

function walkDir(dir, baseDir = "") {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.join(baseDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, relPath);
    } else {
      processImage(fullPath, relPath);
    }
  }
}

walkDir(inputDir);
