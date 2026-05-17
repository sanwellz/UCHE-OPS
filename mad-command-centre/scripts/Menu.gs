// ── MENU ─────────────────────────────────────────────────────────────────────
// Adds a "MAD Command Centre" menu to the Google Sheet toolbar.
// Runs automatically every time the sheet is opened.

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('MAD Command Centre')
    .addItem('Run Setup (first time only)', 'setupAllSheets')
    .addSeparator()
    .addItem('Save Weekly Report', 'saveWeeklyReport')
    .addItem('Save DSP Pitch Entry', 'saveDSPPitch')
    .addItem('Save Artist Scorecard', 'saveArtistScorecard')
    .addItem('Save YouTube Analytics', 'saveYouTubeAnalytics')
    .addItem('Save Meeting Log Entry', 'saveMeetingLog')
    .addItem('Save MADCAPP Proposal', 'saveMADCAPPProposal')
    .addItem('Save Campaign Plan', 'saveCampaignPlan')
    .addItem('Save Proof Brief', 'saveProofBrief')
    .addToUi();
}
