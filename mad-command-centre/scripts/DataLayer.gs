function getSheet(sheetName) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
}

function readRows(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return rows;
}

function appendRow(sheetName, rowObj) {
  var sheet = getSheet(sheetName);
  var headers = CONFIG.HEADERS[sheetName];
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    row.push(rowObj[headers[i]] !== undefined ? rowObj[headers[i]] : '');
  }
  sheet.appendRow(row);

  var lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, headers.length)
      .setBackground(CONFIG.STYLE.ALT_ROW_BG);
  }
}

function updateRowById(sheetName, id, updates) {
  var sheet = getSheet(sheetName);
  var headers = CONFIG.HEADERS[sheetName];
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      for (var j = 0; j < headers.length; j++) {
        if (updates[headers[j]] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(updates[headers[j]]);
        }
      }
      return true;
    }
  }
  return false;
}
