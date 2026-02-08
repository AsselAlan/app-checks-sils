import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import { checklistConfig } from './checklistConfig';

// Utility to approximate text wrapping or just truncating
function drawText(page: any, text: string, x: number, y: number, font: PDFFont, size: number = 10) {
    page.drawText(text || "", {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
    });
}

// Draw a circle around an option
// Draw a circle/oval around an option
function drawCircle(page: any, x: number, y: number, xScale: number = 15, yScale: number = 15) {
    page.drawEllipse({
        x,
        y,
        xScale,
        yScale,
        borderWidth: 2,
        borderColor: rgb(1, 0, 0), // RED circle
        color: undefined, // Transparent fill
        opacity: 0.8,
    });
}

// MAPPING COORDINATES (Adjusted for A4 Portrait 595 x 842 points)
// Origin (0,0) is bottom-left.
// MAPPING COORDINATES (Adjusted for A4 Portrait 595 x 842 points)
// Origin (0,0) is bottom-left.
const COORDS: any = {
    // Header
    // Lowered Y to avoid overlapping the line labels
    fecha_hora: { x: 145, y: 682 },
    transportista: { x: 400, y: 682 },
    responsable_silstech: { x: 200, y: 662 },
    dominio_interno_tc: { x: 180, y: 642 },
    dominio_sr: { x: 380, y: 642 },

    // Table 1: Tractor
    // Adjusted Y for better vertical centering
    tractor_encendido: { y: 515 },
    tractor_fallas_tablero: { y: 490 },
    tractor_parabrisas_luces: { y: 465 },
    tractor_tacografo: { y: 445 },
    tractor_zona_trasera: { y: 420 },

    // Table 2: Instalación TLK
    tlk_alimentacion: { y: 320 },
    tlk_empalmes: { y: 290 },
    tlk_cables: { y: 270 },
    tlk_antena: { y: 240 },
    tlk_funcionamiento: { y: 215 },

    // Signatures
    // Header signature (Aligning with "FIRMA Y ACLARACIÓN" row approx Y=662)
    firma_responsable_silstech: { x: 420, y: 640, w: 120, h: 45 },
    // Footer signature (Moving up slightly to be safer)
    nombre_representante: { x: 250, y: 140 }, // Placed above the signature line "REPRESENTANTE DE TRANSPORTISTA:"
    firma_representante_transportista: { x: 100, y: 70, w: 150, h: 50 },
};

// Shifting columns LEFT significantly based on screenshot
const X_POS = {
    APTO: 270,      // Shifted left to center on "APTO"
    NO_APTO: 320,   // Shifted left to center on "NO APTO"
    OBS: 350        // Shifted left to start in Observaciones column
};

export async function fillPdf(formData: any) {
    const existingPdfBytes = await fetch('/checklist.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.getPages()[0]; // Assume single page
    const { width, height } = page.getSize();
    console.log(`Page size: ${width} x ${height}`);

    // Fill Header Data
    // We iterate over keys in formData and check if we have a coordinate mapping
    for (const key in formData) {
        if (COORDS[key] && !key.startsWith('tractor_') && !key.startsWith('tlk_') && !key.startsWith('firma_')) {
            let textToDraw = formData[key];

            // Format date if key is 'fecha_hora'
            // Input format: YYYY-MM-DDTHH:mm
            // Desired format: DD/M/YY - HH:mmhs
            if (key === 'fecha_hora' && textToDraw) {
                try {
                    const dateObj = new Date(textToDraw);
                    const day = dateObj.getDate();
                    const month = dateObj.getMonth() + 1;
                    const year = dateObj.getFullYear().toString().slice(-2); // YY
                    const hours = String(dateObj.getHours()).padStart(2, '0');
                    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

                    textToDraw = `${day}/${month}/${year} - ${hours}:${minutes}hs`;
                } catch (e) {
                    console.error('Error formatting date', e);
                }
            }

            drawText(page, textToDraw, COORDS[key].x, COORDS[key].y, font);
        }
    }

    // Fill Table Rows (Evaluation Rows)
    // We look for special keys in formData: `${id}_condition` and `${id}_observation`
    // The config has the IDs.
    checklistConfig.sections.forEach(section => {
        if (section.items) {
            section.items.forEach(item => {
                const baseId = item.id;
                const condition = formData[`${baseId}_condition`]; // 'apto' | 'no_apto'
                const observation = formData[`${baseId}_observation`];

                const rowCoords = COORDS[baseId];
                if (rowCoords) {
                    // Draw Circle for condition
                    if (condition === 'apto') {
                        drawCircle(page, X_POS.APTO, rowCoords.y, 20, 13);
                    } else if (condition === 'no_apto') {
                        drawCircle(page, X_POS.NO_APTO, rowCoords.y, 25, 13);
                    }

                    // Draw Observation Text
                    if (observation) {
                        drawText(page, observation, X_POS.OBS, rowCoords.y, font, 9);
                    }
                }
            });
        }
    });


    // Handle signatures
    // Handle signatures
    for (const key in formData) {
        if (key.startsWith('firma_') && formData[key]) {
            try {
                const sigCoords = COORDS[key];
                if (sigCoords) {
                    const imageBytes = await fetch(formData[key]).then(res => res.arrayBuffer());
                    const pngImage = await pdfDoc.embedPng(imageBytes);

                    page.drawImage(pngImage, {
                        x: sigCoords.x,
                        y: sigCoords.y,
                        width: sigCoords.w,
                        height: sigCoords.h,
                    });
                }
            } catch (e) {
                console.error(`Error embedding signature for ${key}`, e);
            }
        }
    }

    // Since we modified the page directly, no need to flatten traditionally if no form fields were used.
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
