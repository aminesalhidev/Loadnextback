const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5003;

// Percorsi base
const downloadsDir = path.join(__dirname, 'downloads');
const ytDlpPath = path.join(__dirname, 'yt-dlp'); // Su Render non è .exe

// Crea la cartella downloads se non esiste
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Rotta base
app.get('/', (req, res) => {
  res.send('✅ Server attivo!');
});

// Static file hosting
app.use('/downloads', express.static(downloadsDir));

// API download
app.post('/api/download', (req, res) => {
  const { link } = req.body;

  if (!link) {
    return res.status(400).json({ success: false, message: '❗ Link mancante' });
  }

  if (!fs.existsSync(ytDlpPath)) {
    return res.status(500).json({
      success: false,
      message: '❌ yt-dlp non disponibile. Riprova tra qualche momento.'
    });
  }

  const nomeFile = `video_${Date.now()}.mp4`;
  const outputPath = path.join(downloadsDir, nomeFile);

  const command = `"${ytDlpPath}" -f best -o "${outputPath}" ${link}`;
  console.log('📥 Download in corso per:', link);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Errore durante il download:', stderr || error.message);
      return res.status(500).json({
        success: false,
        message: 'Errore durante il download. Assicurati che il link sia valido e che yt-dlp sia installato.'
      });
    }

    console.log('✅ Download completato');
    const fileUrl = `https://loadnextback-1.onrender.com/downloads/${nomeFile}`;
    return res.json({
      success: true,
      message: '✅ Download completato con successo',
      fileUrl
    });
  });
});

// Avvio server
app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
});
