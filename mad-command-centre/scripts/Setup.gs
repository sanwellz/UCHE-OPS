// ── SETUP ────────────────────────────────────────────────────────────────────
// Run setupAllSheets() once to initialise headers, formatting, and Drive folder.
// Safe to re-run — it will not delete existing data rows.

function setupAllSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const results = [];

  for (const [sheetName, headers] of Object.entries(CONFIG.HEADERS)) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      results.push(`MISSING: ${sheetName} — create this tab and re-run`);
      continue;
    }

    // Write headers only if row 1 is empty
    const existing = sheet.getRange(1, 1).getValue();
    if (!existing) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange
      .setBackground(CONFIG.STYLE.HEADER_BG)
      .setFontColor(CONFIG.STYLE.HEADER_FG)
      .setFontWeight('bold')
      .setFontSize(10)
      .setVerticalAlignment('middle');

    // Freeze header row
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, CONFIG.STYLE.HEADER_HEIGHT);

    // Set column widths — wider for text-heavy columns
    headers.forEach((h, i) => {
      const wide = ['Operations','Distribution','Content','Finance',
                    'Flagged Items','Priorities','Decisions','Action Items',
                    'Supporting Data','Notes','Doc Link'].includes(h);
      sheet.setColumnWidth(i + 1, wide ? CONFIG.STYLE.WIDE_COL_W : CONFIG.STYLE.DEFAULT_COL_W);
    });

    results.push(`OK: ${sheetName}`);
  }

  // Create Drive output folder if it does not exist
  ensureOutputFolder();

  Logger.log('Setup complete:\n' + results.join('\n'));
  SpreadsheetApp.getUi().alert('Setup complete:\n\n' + results.join('\n'));
}

function ensureOutputFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  if (!folders.hasNext()) {
    DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
    Logger.log(`Created Drive folder: ${CONFIG.DRIVE_FOLDER_NAME}`);
  }
}
