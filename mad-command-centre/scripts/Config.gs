// ── CONFIG ───────────────────────────────────────────────────────────────────
// Single source of truth. When migrating back to the Node.js dashboard,
// only the DataLayer.gs file needs to change — all module logic stays identical.

const CONFIG = {
  SPREADSHEET_ID: '1VyQ_u8bkWCNE6BoRDtB77s0S1Sou5vlVykWYgGr4zHE',
  DRIVE_FOLDER_NAME: 'MAD Command Centre Outputs',

  SHEETS: {
    WEEKLY_REPORTS:    'Weekly Reports',
    DSP_PITCHES:       'DSP Pitches',
    ARTIST_SCORECARDS: 'Artist Scorecards',
    YOUTUBE_ANALYTICS: 'YouTube Analytics',
    MEETING_LOG:       'Meeting Log',
    MADCAPP_PROPOSALS: 'MADCAPP Proposals',
    CAMPAIGN_PLANS:    'Campaign Plans',
    PROOF_BRIEFS:      'Proof Briefs',
  },

  HEADERS: {
    'Weekly Reports':    ['ID', 'Week Ending', 'Operations', 'Distribution', 'Content', 'Finance', 'Flagged Items', 'Priorities', 'Generated At', 'Doc Link'],
    'DSP Pitches':       ['ID', 'Date', 'Artist', 'Track', 'Genre', 'Streams (28d)', 'Velocity %', 'Territory Strength', 'UGC Signal', 'Recency Score', 'Total Score', 'Pitch Recommended', 'Notes', 'Doc Link'],
    'Artist Scorecards': ['ID', 'Artist', 'Period', 'Spotify Streams', 'Apple Streams', 'FUGA Revenue (USD)', 'Top Territory', 'MoM Delta %', 'MADCAPP Eligible', 'Advance Estimate (USD)', 'Notes', 'Doc Link'],
    'YouTube Analytics': ['ID', 'Channel', 'Period', 'Views', 'Watch Time (hrs)', 'CPM (USD)', 'RPM (USD)', 'Top Territory', 'Retention %', 'Top Traffic Source', 'Notes', 'Doc Link'],
    'Meeting Log':       ['ID', 'Date', 'Attendees', 'Decisions', 'Action Items', 'Owners', 'Deadlines', 'Notes'],
    'MADCAPP Proposals': ['ID', 'Date', 'Artist', '12M Revenue (USD)', 'Advance Amount (USD)', 'Repayment Period (mo)', 'Risk Flag', 'Status', 'Doc Link'],
    'Campaign Plans':    ['ID', 'Date', 'Artist', 'Release Title', 'Release Date', 'Genre', 'Territories', 'Budget Tier', 'Status', 'Doc Link'],
    'Proof Briefs':      ['ID', 'Date', 'Claim', 'Supporting Data', 'Source', 'Time Window', 'Confidence', 'Notes', 'Doc Link'],
  },

  // Header row visual style
  STYLE: {
    HEADER_BG:      '#0a0e1a',
    HEADER_FG:      '#ffffff',
    ALT_ROW_BG:     '#f8f8fc',
    HEADER_HEIGHT:  32,
    DEFAULT_COL_W:  160,
    WIDE_COL_W:     280,
  }
};
