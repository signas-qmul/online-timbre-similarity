const fs = require('fs');
const pdfLib = require('pdf-lib');

/**
 * Given an IP address and date string, return a digitally signed PDF of the
 * consent form.
 *
 * @param {string} ip Client IP address as string
 * @param {string} date Today's date as string
 * @return {Uint8Array} The populated PDF document
 */
async function createCompletedConsentForm(ip, date) {
  const ipString = `Digital signature: ${ip}`;
  const pdfInBytes = fs.readFileSync('res/consent_form.pdf');
  const pdfDoc = await pdfLib.PDFDocument.load(pdfInBytes);
  const font = pdfDoc.fonts[0];
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  lastPage.drawText(
      ipString,
      {
        x: 93,
        y: 650,
        font,
        size: 14,
      });
  lastPage.drawText(
      date,
      {
        x: 378,
        y: 650,
        font,
        size: 14,
      },
  );
  lastPage.drawText(
      date,
      {
        x: 378,
        y: 460,
        font,
        size: 14,
      },
  );
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

module.exports = {createCompletedConsentForm};
