import * as pdfjsLib from 'pdfjs-dist';

// Cấu hình web worker cho pdfjs-dist trong môi trường Vite
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch {
  // Fallback sang CDN unpkg nếu môi trường bundler không phân giải được URL cục bộ
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
}

/**
 * Trích xuất trang đầu tiên của file PDF làm ảnh thumbnail (JPEG Blob) và đếm tổng số trang
 * @param {File|Blob} file - File PDF người dùng vừa chọn
 * @returns {Promise<{ thumbnailBlob: Blob | null, pageCount: number, previewUrl: string }>}
 */
export async function extractPdfCover(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    const pdfDoc = await loadingTask.promise;

    const pageCount = pdfDoc.numPages || 1;
    const page = await pdfDoc.getPage(1);

    // Kích thước thumbnail tiêu chuẩn: chiều rộng ~600px để hiển thị sắc nét trên cả màn hình Retina
    const defaultViewport = page.getViewport({ scale: 1.0 });
    const targetWidth = 600;
    const scale = Math.max(0.8, Math.min(2.0, targetWidth / defaultViewport.width));
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const context = canvas.getContext('2d', { willReadFrequently: true });

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ thumbnailBlob: null, pageCount, previewUrl: '' });
            return;
          }
          const previewUrl = URL.createObjectURL(blob);
          resolve({
            thumbnailBlob: blob,
            pageCount,
            previewUrl,
          });
        },
        'image/jpeg',
        0.88
      );
    });
  } catch (error) {
    console.warn('[PDF Thumbnail] Không thể tự động trích xuất trang bìa:', error);
    return { thumbnailBlob: null, pageCount: null, previewUrl: '' };
  }
}
