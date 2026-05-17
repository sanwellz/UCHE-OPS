// ── DATA LAYER ───────────────────────────────────────────────────────────────
// All Sheets read/write operations live here and nowhere else.
// MIGRATION NOTE: When moving back to the Node.js dashboard, replace this file
// with a Node.js equivalent that reads/writes JSON files in /data — all module
// logic above this layer stays identical.

function getSheet(sheetName) {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(sheetName);
}

// Returns all data rows as an array of objects keyed by header name
function readRows(sheetName) {
  const sheet = getSheet(sheetName);
  const data  = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

// Appends a single row. Pass an object keyed by header name.
function appendRow(sheetName, rowObj) {
  const sheet   = getSheet(sheetName);
  const headers = CONFIG.HEADERS[sheetName];
  const row     = headers.map(h => rowObj[h] !== undefined ? rowObj[h] : '');
  sheet.appendRow(row);

  // Zebra stripe the new row
  const lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, headers.length)
      .setBackground(CONFIG.STYLE.ALT_ROW_BG);
  }
}

// Updates a specific row by ID (first column)
function updateRowById(sheetName, id, updates) {
  const sheet   = getSheet(sheetName);
  const headers = CONFIG.HEADERS[sheetName];
  const data    = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      headers.forEach((h, col) => {
        if (updates[h] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(updates[h]);
        }
      });
      return true;
    }
  }
  return false;
}

// Generates a simple timestamped ID: e.g. WR-20260516-001
function generateId(prefix) {
  const date  = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd');
  const sheet = getSheet(Object.values(CONFIG.SHEETS).find(s =>
    CONFIG.HEADERS[s] && CONFIG.HEADERS[s][0] === 'ID'
  ));
  const count = sheet ? sheet.getLastRow() : 1;
  return `${prefix}-${date}-${String(count).padStart(3, '0')}`;
}

// Saves a Google Doc to the MAD Command Centre Outputs Drive folder
// Returns the Doc URL
function saveDocToDrive(title, content) {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  const folder  = folders.hasNext() ? folders.next() : DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);

  const doc  = DocumentApp.create(title);
  const body = doc.getBody();
  body.clear();

  // Parse and write sections
  const lines = content.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) { body.appendParagraph(''); return; }

    const headingMatch = trimmed.match(/^\*\*([A-Z][A-Z\s']+)\*\*$/);
    if (headingMatch) {
      const p = body.appendParagraph(headingMatch[1]);
      p.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      p.editAsText().setForegroundColor('#0a0e1a').setBold(true);
    } else {
      const cleaned = trimmed.replace(/\*\*([^*]+)\*\*/g, '$1');
      body.appendParagraph(cleaned);
    }
  });

  doc.saveAndClose();

  // Move to output folder
  const file = DriveApp.getFileById(doc.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  return doc.getUrl();
}
