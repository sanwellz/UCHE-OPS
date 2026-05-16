const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const systemPrompt = require('../prompts/weekly-report');
const { generateDocx } = require('../modules/weekly-report');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory store for the last generated report (single user, local tool)
let lastReport = null;

router.post('/generate', async (req, res) => {
  const { input, weekEnding } = req.body;

  if (!input || !input.trim()) {
    return res.status(400).json({ error: 'Input is required.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const userMessage = weekEnding
    ? `Week ending: ${weekEnding}\n\n${input.trim()}`
    : input.trim();

  let fullText = '';

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    stream.on('text', (text) => {
      fullText += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    await stream.finalMessage();

    lastReport = { text: fullText, weekEnding, generatedAt: new Date().toISOString() };
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

router.get('/download', async (req, res) => {
  if (!lastReport) {
    return res.status(400).json({ error: 'No report generated yet.' });
  }

  try {
    const buffer = await generateDocx(lastReport);
    const slug = (lastReport.weekEnding || lastReport.generatedAt.slice(0, 10)).replace(/\s+/g, '-');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="gm-report-${slug}.docx"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
