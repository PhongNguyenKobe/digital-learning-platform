const fs = require('fs/promises');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const env = require('../config/env');

const execFileAsync = promisify(execFile);

async function createPdfCover(filePath, thumbnailDirectory) {
  const prefix = path.join(thumbnailDirectory, `cover-${Date.now()}-${Math.round(Math.random() * 1e9)}`);
  try {
    await execFileAsync(env.pdfImageCommand, ['-f', '1', '-singlefile', '-scale-to-x', '1200', '-jpeg', filePath, prefix], { timeout: 120000, windowsHide: true });
    const outputPath = `${prefix}.jpg`;
    await fs.access(outputPath);
    return { path: outputPath, filename: path.basename(outputPath), mimetype: 'image/jpeg' };
  } catch (error) {
    await fs.unlink(`${prefix}.jpg`).catch(() => {});
    return null;
  }
}

module.exports = { createPdfCover };
