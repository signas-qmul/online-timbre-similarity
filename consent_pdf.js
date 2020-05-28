const fs = require('fs');
const pdf_lib = require('pdf-lib');

async function createCompletedConsentForm(ip, date) {
    const pdfInBytes = fs.readFileSync('res/consent_form.pdf');
    const pdfDoc = await pdf_lib.PDFDocument.load(pdfInBytes);
    console.log(pdfDoc);
    const pages = pdfDoc.getPages();
    pages[0].drawText('Test 123');
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

module.exports = {createCompletedConsentForm};