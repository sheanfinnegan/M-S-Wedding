/**
 * Google Sheets RSVP endpoint for Michael & Sharen.
 * Create a Google Sheet, open Extensions > Apps Script, paste this file,
 * then deploy as a Web app (execute as you, access: anyone).
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const rawBody = e && e.postData && e.postData.contents || '';
    let data;
    try {
      data = rawBody ? JSON.parse(rawBody) : (e && e.parameter) || {};
    } catch (error) {
      data = (e && e.parameter) || {};
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const expectedHeaders = ['Waktu Kirim', 'Nama', 'WhatsApp', 'Jumlah Tamu', 'Pesan', 'Kategori Undangan'];
    if (sheet.getLastRow() === 0) {
      sheet.setFrozenRows(1);
    } else {
      let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      const attendanceColumn = headers.indexOf('Kehadiran') + 1;
      if (attendanceColumn > 0) {
        sheet.deleteColumn(attendanceColumn);
      }
    }
    if (sheet.getMaxColumns() < expectedHeaders.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), expectedHeaders.length - sheet.getMaxColumns());
    }
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    sheet.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
    sheet.getRange('D:D').setNumberFormat('0');
    sheet.appendRow([
      new Date(),
      safeCell(data.name || data.fullName || data['Full Name']),
      safeCell(data.phone || data.whatsapp || data['Phone Number / WA']),
      Math.max(1, Math.min(2, Number(data.guests || data.guestCount) || 1)),
      safeCell(data.message),
      safeCell(data.invitationCategory || data.invitationType)
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
