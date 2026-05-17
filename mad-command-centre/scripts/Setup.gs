function setupAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var results = [];
  var sheetNames = Object.keys(CONFIG.HEADERS);

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName = sheetNames[i];
    var headers = CONFIG.HEADERS[sheetName];
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      results.push('MISSING: ' + sheetName);
      continue;
    }

    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setBackground(CONFIG.STYLE.HEADER_BG)
      .setFontColor(CONFIG.STYLE.HEADER_FG)
      .setFontWeight('bold')
      .setFontSize(10)
      .setVerticalAlignment('middle');

    sheet.setFrozenRows(1);
    sheet.setRowHeights(1, 1, CONFIG.STYLE.HEADER_HEIGHT);
    sheet.setColumnWidths(1, headers.length, CONFIG.STYLE.DEFAULT_COL_W);

    results.push('OK: ' + sheetName);
  }

  SpreadsheetApp.getUi().alert('Setup complete:\n\n' + results.join('\n'));
}
