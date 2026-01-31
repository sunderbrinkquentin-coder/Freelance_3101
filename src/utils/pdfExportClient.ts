/**
 * 🔥 PDF Export Utility - Client-Side
 *
 * Konvertiert die gerenderte CV-Ansicht direkt im Browser zu PDF
 * Nutzt html2canvas + jspdf für Layout-Treue
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFExportOptions {
  filename?: string;
  quality?: number; // 0.1 - 1.0
  scale?: number; // Rendering-Qualität (1 = normal, 2 = high DPI)
}

/**
 * Findet intelligente Seitenumbruch-Positionen basierend auf Section-Grenzen
 */
function findSmartPageBreaks(
  element: HTMLElement,
  pageHeightPx: number,
  scale: number
): number[] {
  const breakPoints: number[] = [];

  // Finde alle Sections im CV
  const sections = Array.from(element.querySelectorAll(
    '.cv-template-section, [class*="section"], h2, .mb-3, .mb-4, .mb-6, .space-y-6 > div'
  )) as HTMLElement[];

  const elementRect = element.getBoundingClientRect();

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const relativeTop = (rect.top - elementRect.top) * scale;

    // Prüfe, ob diese Position nahe an einem Seitenumbruch ist
    const pageNumber = Math.floor(relativeTop / pageHeightPx);
    const positionInPage = relativeTop % pageHeightPx;

    // Wenn die Section nahe am Ende einer Seite beginnt (letztes Viertel),
    // markiere diese Position als potenziellen Break Point
    if (positionInPage > pageHeightPx * 0.7 && positionInPage < pageHeightPx * 0.95) {
      breakPoints.push(relativeTop);
    }
  });

  return breakPoints.sort((a, b) => a - b);
}

/**
 * Berechnet optimale Seitenumbrüche unter Berücksichtigung von Section-Grenzen
 */
function calculateOptimalPageBreaks(
  contentHeight: number,
  pageHeight: number,
  smartBreaks: number[]
): number[] {
  const pages: number[] = [0];
  let currentPageEnd = pageHeight;

  while (currentPageEnd < contentHeight) {
    // Finde den nächsten Smart Break in der Nähe des aktuellen Seitenumbruchs
    const idealBreak = currentPageEnd;
    const searchRangeStart = idealBreak - (pageHeight * 0.15); // 15% Toleranz nach oben
    const searchRangeEnd = idealBreak + (pageHeight * 0.05); // 5% Toleranz nach unten

    const nearbyBreak = smartBreaks.find(
      (breakPoint) => breakPoint >= searchRangeStart && breakPoint <= searchRangeEnd
    );

    if (nearbyBreak) {
      pages.push(nearbyBreak);
      currentPageEnd = nearbyBreak + pageHeight;
    } else {
      pages.push(idealBreak);
      currentPageEnd += pageHeight;
    }
  }

  return pages;
}

/**
 * Rendert ein HTML-Element in ein PDF und gibt einen Blob zurück.
 * Basis-Funktion, auf der alle anderen Exporte aufbauen.
 * Nutzt intelligente Seitenumbrüche an Section-Grenzen.
 */
async function renderElementToPDFBlob(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const {
    quality = 0.95,
    scale = 2,
  } = options;

  console.log('[PDF Export] 🚀 Starting PDF generation (Blob)...');
  console.log('[PDF Export] Options:', { quality, scale });

  // Force desktop width for PDF export (A4 width at 96 DPI)
  const originalMinWidth = element.style.minWidth;
  const originalWidth = element.style.width;
  element.style.minWidth = '794px';
  element.style.width = '794px';

  // 1. Canvas aus dem DOM-Element erstellen (mit Error-Handling)
  let canvas;
  try {
    canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
      windowWidth: 794,
    });
  } catch (error: any) {
    // Restore original width auch bei Fehler
    element.style.minWidth = originalMinWidth;
    element.style.width = originalWidth;

    console.error('[PDF Export] ❌ html2canvas error:', error);

    // Check für CORS-spezifische Fehler
    if (error.message?.includes('tainted') || error.message?.includes('CORS')) {
      throw new Error(
        'PDF-Generierung fehlgeschlagen: Bilder müssen von derselben Domain stammen oder CORS-kompatibel sein. ' +
        'Bitte verwende Base64-Bilder für Profilfotos.'
      );
    }

    throw new Error('PDF-Generierung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
  }

  // Restore original width
  element.style.minWidth = originalMinWidth;
  element.style.width = originalWidth;

  console.log('[PDF Export] ✅ Canvas created:', {
    width: canvas.width,
    height: canvas.height,
  });

  // 2. A4 Dimensionen berechnen
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const imgWidth = A4_WIDTH_MM;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pageHeightMM = A4_HEIGHT_MM;
  const pageHeightPx = (canvas.height * pageHeightMM) / imgHeight;

  // 3. Finde intelligente Seitenumbrüche
  const smartBreaks = findSmartPageBreaks(element, pageHeightPx, scale);
  console.log('[PDF Export] 📍 Found smart break points:', smartBreaks.length);

  // 4. Berechne optimale Seitenumbrüche
  const pageBreaks = calculateOptimalPageBreaks(canvas.height, pageHeightPx, smartBreaks);
  console.log('[PDF Export] 📄 Calculated pages:', pageBreaks.length);

  // 5. jsPDF-Dokument erstellen
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // 6. Erstelle ein Canvas für jede Seite
  for (let i = 0; i < pageBreaks.length - 1; i++) {
    const startY = pageBreaks[i];
    const endY = pageBreaks[i + 1] || canvas.height;
    const pageHeight = endY - startY;

    // Erstelle einen Ausschnitt für diese Seite
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = pageHeight;

    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        canvas,
        0, startY, canvas.width, pageHeight,
        0, 0, canvas.width, pageHeight
      );
    }

    const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
    const pageImgHeight = (pageHeight * imgWidth) / canvas.width;

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, pageImgHeight, undefined, 'FAST');
  }

  // Fallback: Falls keine Breaks gefunden wurden, verwende alte Methode
  if (pageBreaks.length <= 1) {
    console.log('[PDF Export] ⚠️ No smart breaks found, using fallback method');
    const imgData = canvas.toDataURL('image/jpeg', quality);

    if (imgHeight <= pageHeightMM) {
      // Passt auf eine Seite
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // Mehrere Seiten notwendig
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeightMM;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeightMM;
      }
    }
  }

  console.log('[PDF Export] ✅ PDF created successfully (Blob mode)');

  // 7. Blob zurückgeben
  const blob = pdf.output('blob') as Blob;
  return blob;
}

/**
 * Exportiert ein HTML-Element als PDF und triggert direkt den Download im Browser
 *
 * @param element - Das HTML-Element, das exportiert werden soll
 * @param options - Export-Optionen
 * @returns Promise<void>
 */
export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = `CV_${new Date().toISOString().split('T')[0]}.pdf`,
  } = options;

  try {
    const pdfBlob = await renderElementToPDFBlob(element, options);

    // Clientseitigen Download auslösen
    const blobUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);

    console.log('[PDF Export] 💾 PDF download triggered:', filename);
  } catch (error) {
    console.error('[PDF Export] ❌ Error generating PDF:', error);
    throw new Error('PDF-Generierung fehlgeschlagen. Bitte versuche es erneut.');
  }
}

/**
 * Exportiert einen CV als PDF basierend auf einer Ref zum CV-Container
 * und triggert direkt den Download.
 *
 * @param cvRef - React Ref zum CV-Container Element
 * @param personalInfo - Persönliche Daten für Dateiname
 * @param options - Export-Optionen
 */
export async function exportCVToPDF(
  cvRef: React.RefObject<HTMLElement>,
  personalInfo?: { name?: string },
  options?: PDFExportOptions
): Promise<void> {
  if (!cvRef.current) {
    throw new Error('CV-Element nicht gefunden');
  }

  const name = personalInfo?.name || 'CV';
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;

  await exportElementToPDF(cvRef.current, {
    ...options,
    filename,
  });
}

/**
 * NEU: Exportiert den CV als PDF-Blob (für Upload nach Supabase Storage).
 *
 * @param cvRef - React Ref zum CV-Container Element
 * @param personalInfo - Persönliche Daten (optional für Logging / spätere Nutzung)
 * @param options - Export-Optionen
 * @returns Promise<Blob> - PDF als Blob (z.B. für Supabase Storage Upload)
 */
export async function exportCVToPDFBlob(
  cvRef: React.RefObject<HTMLElement>,
  personalInfo?: { name?: string },
  options?: PDFExportOptions
): Promise<Blob> {
  if (!cvRef.current) {
    throw new Error('CV-Element nicht gefunden');
  }

  const name = personalInfo?.name || 'CV';
  console.log('[PDF Export] 🧾 Generating PDF Blob for:', name);

  const blob = await renderElementToPDFBlob(cvRef.current, options);

  return blob;
}
