function setupWeeklyReportsSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Weekly Reports');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Weekly Reports tab not found.');
    return;
  }
  var headers = ['Week Ending', 'Date Saved', 'Report Summary', 'Full Report Doc Link', 'Status'];
  sheet.getRange(1, 1, 1, 5)
    .setValues([headers])
    .setBackground('#0a0e1a')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(10)
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeights(1, 1, 32);
  sheet.setColumnWidths(1, 5, 160);
  sheet.setColumnWidth(3, 420);
  SpreadsheetApp.getActiveSpreadsheet().toast('Weekly Reports sheet configured.', 'Done', 5);
}

function saveWeeklyReport() {
  var html =
    '<html><head><style>' +
    'body{font-family:Arial,sans-serif;font-size:13px;margin:0;padding:20px;background:#f5f5f7;}' +
    '.field{margin-bottom:14px;}' +
    'label{display:block;font-size:9px;font-weight:bold;letter-spacing:0.1em;color:#555;margin-bottom:5px;text-transform:uppercase;}' +
    'input,textarea{width:100%;box-sizing:border-box;border:1px solid #ddd;border-radius:3px;padding:8px 10px;font-size:12px;font-family:Arial;color:#111;outline:none;}' +
    'input:focus,textarea:focus{border-color:#0a0e1a;}' +
    'textarea{height:240px;resize:vertical;line-height:1.6;}' +
    '.btn{background:#0a0e1a;color:#fff;border:none;padding:10px 22px;font-size:10px;font-weight:bold;letter-spacing:0.1em;cursor:pointer;border-radius:3px;margin-top:4px;}' +
    '.btn:disabled{opacity:0.4;cursor:not-allowed;}' +
    '.status{margin-top:12px;font-size:11px;color:#444;line-height:1.5;}' +
    'a{color:#0a0e1a;font-weight:bold;}' +
    '</style></head><body>' +
    '<div class="field"><label>Week Ending</label>' +
    '<input type="text" id="weekEnding" placeholder="e.g. 16 May 2026" /></div>' +
    '<div class="field"><label>Full Report Text (paste from Claude)</label>' +
    '<textarea id="reportText" placeholder="Paste the structured report text here..."></textarea></div>' +
    '<button class="btn" id="saveBtn" onclick="submit()">SAVE REPORT</button>' +
    '<div class="status" id="status"></div>' +
    '<script>' +
    'function submit(){' +
    '  var w=document.getElementById("weekEnding").value.trim();' +
    '  var r=document.getElementById("reportText").value.trim();' +
    '  if(!w){document.getElementById("status").innerText="Week ending date is required.";return;}' +
    '  if(!r){document.getElementById("status").innerText="Report text is required.";return;}' +
    '  document.getElementById("status").innerText="Saving...";' +
    '  document.getElementById("saveBtn").disabled=true;' +
    '  google.script.run' +
    '    .withSuccessHandler(function(url){' +
    '      document.getElementById("status").innerHTML="Saved. <a href=\'"+url+"\' target=\'_blank\'>Open Doc</a>";' +
    '    })' +
    '    .withFailureHandler(function(e){' +
    '      document.getElementById("status").innerText="Error: "+e.message;' +
    '      document.getElementById("saveBtn").disabled=false;' +
    '    })' +
    '    .processWeeklyReport(w,r);' +
    '}' +
    '</script></body></html>';

  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(500).setHeight(480),
    'Save Weekly GM Report'
  );
}

function processWeeklyReport(weekEnding, reportText) {
  var summary = reportText.length > 200 ? reportText.substring(0, 200) + '...' : reportText;
  var docUrl = createWeeklyReportDoc('MAD Solutions GM Report - Week Ending ' + weekEnding, weekEnding, reportText);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Weekly Reports');
  var dateSaved = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd MMM yyyy, HH:mm');

  sheet.appendRow([weekEnding, dateSaved, summary, '', 'Saved']);
  var lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, 5).setBackground('#f8f8fc');
  }
  sheet.getRange(lastRow, 4).setFormula('=HYPERLINK("' + docUrl + '","Open Report")');

  return docUrl;
}

function createWeeklyReportDoc(title, weekEnding, reportText) {
  var folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);

  var doc = DocumentApp.create(title);
  var body = doc.getBody();
  body.clear();
  body.setMarginTop(36);
  body.setMarginBottom(36);
  body.setMarginLeft(54);
  body.setMarginRight(54);

  // Set body default style once — avoids formatting every line individually
  var bodyStyle = {};
  bodyStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
  bodyStyle[DocumentApp.Attribute.FONT_SIZE] = 10;
  bodyStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#222233';
  bodyStyle[DocumentApp.Attribute.BOLD] = false;
  body.setAttributes(bodyStyle);

  // Dark header block
  var headerTable = body.appendTable([['']]);
  headerTable.setBorderWidth(0);
  var cell = headerTable.getCell(0, 0);
  cell.setBackgroundColor('#0a0e1a');
  cell.setPaddingTop(20);
  cell.setPaddingBottom(20);
  cell.setPaddingLeft(24);
  cell.setPaddingRight(24);

  var companyLine = cell.insertParagraph(0, 'M.A.D SOLUTIONS');
  companyLine.editAsText().setFontSize(8).setForegroundColor('#9a9aaa').setBold(true);

  var titleLine = cell.insertParagraph(1, 'Weekly GM Report');
  titleLine.editAsText().setFontSize(20).setForegroundColor('#ffffff').setBold(true);

  var weekLine = cell.insertParagraph(2, 'Week ending: ' + weekEnding);
  weekLine.editAsText().setFontSize(10).setForegroundColor('#9a9aaa').setBold(false);

  body.appendParagraph('');

  // Write report body — only section headers get individual formatting
  var lines = reportText.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) {
      body.appendParagraph('');
      continue;
    }
    var sectionMatch = line.match(/^\*\*([^*]+)\*\*$/);
    if (sectionMatch) {
      var sp = body.appendParagraph(sectionMatch[1].trim().toUpperCase());
      sp.setSpacingBefore(14);
      sp.setSpacingAfter(4);
      sp.editAsText().setFontSize(9).setForegroundColor('#0a0e1a').setBold(true);
    } else {
      body.appendParagraph(line.replace(/\*\*([^*]+)\*\*/g, '$1'));
    }
  }

  doc.saveAndClose();

  var file = DriveApp.getFileById(doc.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  return doc.getUrl();
}
