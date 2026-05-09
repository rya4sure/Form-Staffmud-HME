// ==========================================
// KODE GOOGLE APPS SCRIPT
// ==========================================
// 1. Buat Spreadsheet Baru di Google Drive
// 2. Klik Ekstensi > Apps Script
// 3. Hapus semua kode bawaan, lalu paste kode di bawah ini.
// 4. Klik Terapkan (Deploy) > Deployment Baru.
// 5. Pilih "Aplikasi Web", atur "Yang memiliki akses" ke "Siapa saja".
// 6. Klik Terapkan, beri izin akses, lalu salin URL Web App yang muncul.

const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();

function initialSetup () {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);

    // Ambil baris pertama sebagai Header kolom
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    // Buat array baru untuk disisipkan ke baris selanjutnya
    const newRow = headers.map(function(header) {
      if (header === 'Timestamp') {
        return new Date();
      } else {
        return e.parameter[header] || '';
      }
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
