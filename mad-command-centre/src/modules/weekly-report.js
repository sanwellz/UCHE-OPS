const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../../data/weekly-reports');

function parseReportSections(text) {
  const lines = text.split('\n');
  const blocks = [];
  let current = null;

  for (const line of lines) {
    const sectionMatch = line.match(/^\*\*([A-Z][A-Z\s']+)\*\*$/);
    if (sectionMatch) {
      if (current) blocks.push(current);
      current = { heading: sectionMatch[1].trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

function buildParagraphs(sections, weekEnding, generatedAt) {
  const paragraphs = [];

  // Title
  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: 'M.A.D Solutions', bold: true, size: 28, color: '000000' })],
    spacing: { after: 80 },
  }));

  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: 'Weekly GM Report', bold: true, size: 36, color: '000000' })],
    spacing: { after: 120 },
  }));

  if (weekEnding) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: `Week ending: ${weekEnding}`, size: 22, color: '555566' })],
      spacing: { after: 60 },
    }));
  }

  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: `Generated: ${new Date(generatedAt).toUTCString()}`, size: 18, color: '888899' })],
    spacing: { after: 400 },
  }));

  // Divider
  paragraphs.push(new Paragraph({
    border: { bottom: { color: 'cccccc', space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { after: 300 },
  }));

  for (const section of sections) {
    // Section heading
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: section.heading, bold: true, size: 26, color: '111111' })],
      spacing: { before: 300, after: 120 },
    }));

    // Section body
    const bodyLines = section.lines.join('\n').trim();
    if (bodyLines) {
      for (const line of section.lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          paragraphs.push(new Paragraph({ spacing: { after: 60 } }));
          continue;
        }
        // Handle numbered list items
        const listMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (listMatch) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `${listMatch[1]}.  ${listMatch[2]}`, size: 22, color: '222233' })],
            indent: { left: 360 },
            spacing: { after: 80 },
          }));
        } else {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: trimmed, size: 22, color: '222233' })],
            spacing: { after: 80 },
          }));
        }
      }
    }
  }

  return paragraphs;
}

async function generateDocx({ text, weekEnding, generatedAt }) {
  const sections = parseReportSections(text);
  const paragraphs = buildParagraphs(sections, weekEnding, generatedAt);

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const buffer = await Packer.toBuffer(doc);

  // Also persist to disk
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const filename = `gm-report-${(weekEnding || generatedAt.slice(0, 10)).replace(/\s+/g, '-')}.docx`;
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);

  return buffer;
}

module.exports = { generateDocx };
