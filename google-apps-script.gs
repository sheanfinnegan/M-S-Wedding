/**
 * Google Sheets RSVP endpoint for Michael & Sharen.
 * Create a Google Sheet, open Extensions > Apps Script, paste this file,
 * then deploy as a Web app (execute as you, access: anyone).
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Waktu Kirim', 'Nama', 'WhatsApp', 'Kehadiran', 'Jumlah Tamu', 'Pesan']);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      new Date(),
      safeCell(data.name),
      safeCell(data.phone),
      safeCell(data.attendance),
      Math.max(1, Math.min(4, Number(data.guests) || 1)),
      safeCell(data.message)
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function safeCell(value) {
  const text = String(value || '').trim().slice(0, 500);
  return /^[=+@\-]/.test(text) ? `'${text}` : text;
}
