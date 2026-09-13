const fs = require('fs/promises');
const { PDFDocument, StandardFonts, degrees, rgb } = require('pdf-lib');

async function watermarkPdf(filePath, ownerName) {
  const source = await fs.readFile(filePath);
  const document = await PDFDocument.load(source, { ignoreEncryption: false });
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  const label = `HỌC LIỆU SỐ • ${String(ownerName || 'TÀI LIỆU HỌC TẬP').toUpperCase().slice(0, 48)}`;
  for (const page of document.getPages()) {
    const { width, height } = page.getSize();
    page.drawText(label, { x: Math.max(20, width * 0.12), y: height * 0.46, size: Math.max(11, Math.min(22, width / 28)), font, color: rgb(0.12, 0.23, 0.55), opacity: 0.13, rotate: degrees(35) });
  }
  await fs.writeFile(filePath, await document.save());
}

module.exports = { watermarkPdf };
