const fs = require('fs/promises');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const env = require('../config/env');

const execFileAsync = promisify(execFile);
const officePreviewFormats = new Set(['DOC', 'DOCX', 'PPT', 'PPTX']);

function canCreateOfficePreview(fileFormat) {
  return officePreviewFormats.has(String(fileFormat || '').toUpperCase());
}

async function ensureOfficePdfPreview({ documentId, fileFormat, sourcePath, previewDirectory }) {
  if (!canCreateOfficePreview(fileFormat)) return null;

  const previewPath = path.join(previewDirectory, `preview-${documentId}.pdf`);
  try {
    await fs.access(previewPath);
    return previewPath;
  } catch {
    // The preview does not exist yet; LibreOffice will create it below.
  }

  const temporaryDirectory = path.join(previewDirectory, `.convert-${documentId}-${Date.now()}-${Math.round(Math.random() * 1e9)}`);
  await fs.mkdir(temporaryDirectory, { recursive: true });
  try {
    await execFileAsync(
      env.officeConverterCommand,
      ['--headless', '--convert-to', 'pdf', '--outdir', temporaryDirectory, sourcePath],
      { timeout: 120000, windowsHide: true },
    );
    const generatedPath = path.join(temporaryDirectory, `${path.parse(sourcePath).name}.pdf`);
    await fs.access(generatedPath);
    try {
      await fs.rename(generatedPath, previewPath);
    } catch (error) {
      // A simultaneous request may have already generated the same cached preview.
      await fs.access(previewPath);
    }
    return previewPath;
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true }).catch(() => {});
  }
}

module.exports = { canCreateOfficePreview, ensureOfficePdfPreview };
