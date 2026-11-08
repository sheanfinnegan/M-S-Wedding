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
      sheet.appendRow(['Waktu Kirim', 'Nama', 'WhatsApp', 'Jumlah Tamu', 'Pesan', 'Kategori Undangan']);
      sheet.setFrozenRows(1);
    } else {
      let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      const attendanceColumn = headers.indexOf('Kehadiran') + 1;
      if (attendanceColumn > 0) {
        sheet.deleteColumn(attendanceColumn);
        headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      }
      if (!headers.includes('Kategori Undangan')) {
        sheet.getRange(1, headers.length + 1).setValue('Kategori Undangan');
      }
    }
    sheet.appendRow([
      new Date(),
      safeCell(data.name),
      safeCell(data.phone),
      Math.max(1, Math.min(2, Number(data.guests) || 1)),
      safeCell(data.message),
      safeCell(data.invitationCategory)
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
