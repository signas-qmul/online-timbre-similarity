const fs = require('fs');
const pdf_lib = require('pdf-lib');

async function createCompletedConsentForm(ip, date) {
    const ipString = `Digital signature: ${ip}`;
    const pdfInBytes = fs.readFileSync('res/consent_form.pdf');
    const pdfDoc = await pdf_lib.PDFDocument.load(pdfInBytes);
    const font = pdfDoc.fonts[0];
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    lastPage.drawText(
        ipString,
        {
            x: 93,
            y: 650,
            font,
            size: 14
        });
    lastPage.drawText(
        date,
        {
            x: 378,
            y: 650,
            font,
            size: 14
        }
    );
    lastPage.drawText(
        date,
        {
            x: 378,
            y: 460,
            font,
            size: 14
        }
    );
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

module.exports = {createCompletedConsentForm};