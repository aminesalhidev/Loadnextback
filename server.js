const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json());

// Percorsi
const downloadsDir = path.join(__dirname, 'downloads');
const ytDlpPath = path.join(__dirname, 'yt-dlp_linux');

// Crea cartella se non esiste
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Rotta principale
app.get('/', (req, res) => {
  res.send('✅ Server attivo!');
});

// Hosting statico dei file scaricati
app.use('/downloads', express.static(downloadsDir));

// Funzione per validare link TikTok
function isValidTikTokLink(link) {
  return typeof link === 'string' && /^https?:\/\/(www\.)?tiktok\.com/.test(link);
}

// Rotta download
app.post('/api/download', (req, res) => {
  const { link } = req.body;

  if (!link || !isValidTikTokLink(link)) {
    return res.status(400).json({
      success: false,
      message: '❗ Inserisci un link valido di TikTok'
    });
  }

  if (!fs.existsSync(ytDlpPath)) {
    return res.status(500).json({
      success: false,
      message: '❌ yt-dlp non disponibile sul server'
    });
  }

  const nomeFile = `video_${Date.now()}.mp4`;
  const outputPath = path.join(downloadsDir, nomeFile);
  const command = `${ytDlpPath} -f best -o "${outputPath}" "${link}"`;

  console.log('📥 Avvio download:', link);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Errore:', stderr || error.message);
      return res.status(500).json({
        success: false,
        message: 'Errore nel download. Verifica il link TikTok.'
      });
    }

    console.log('✅ Download completato');
    const fileUrl = `https://loadnextback-6.onrender.com/downloads/${nomeFile}`;
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
