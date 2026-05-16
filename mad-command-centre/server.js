const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MAD Command Centre', port: PORT });
});

app.listen(PORT, () => {
  console.log(`MAD Command Centre running at http://localhost:${PORT}`);
});
