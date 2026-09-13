const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character]));
}

async function watermarkThumbnail(file, title) {
  if (!file?.path) return file;
  const outputPath = path.join(path.dirname(file.path), `${path.parse(file.filename).name}-preview.webp`);
  const safeTitle = escapeXml(title || 'TÀI LIỆU XEM TRƯỚC').slice(0, 80);
  const overlay = Buffer.from(`<svg width="1200" height="280" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-24 600 140)" fill="#ffffff" fill-opacity="0.35" font-family="Arial, sans-serif" text-anchor="middle"><text x="600" y="120" font-size="42" font-weight="700">HỌC LIỆU SỐ • PREVIEW</text><text x="600" y="170" font-size="22">${safeTitle}</text></g></svg>`);
  await sharp(file.path)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .composite([{ input: overlay, gravity: 'centre' }])
    .webp({ quality: 82 })
    .toFile(outputPath);
  await fs.unlink(file.path).catch(() => {});
  return { ...file, path: outputPath, filename: path.basename(outputPath), mimetype: 'image/webp' };
}

module.exports = { watermarkThumbnail };
