const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5003;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Server attivo!');
});


// Serve file statici in /downloads
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.post('/api/download', (req, res) => {


  const { link } = req.body;
  console.log('Il server ha ricevuto il link', link);

  if (!link) {
    return res.status(400).json({ success: false, message: 'Link mancante' });
  }  else 



  if (!fs.existsSync(path.join(__dirname, 'downloads'))) {
    fs.mkdirSync(path.join(__dirname, 'downloads'));
  }

  // Nome file unico
  const nomeFile = `video_${Date.now()}.mp4`;
  const outputPath = path.join(__dirname, 'downloads', nomeFile);

const ytDlpPath = path.join(__dirname, 'yt-dlp'); // Linux, no .exe
const command = `"${ytDlpPath}" -f best -o "${outputPath}" ${link}`;


  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Errore durante il download:', error.message);
      return res.status(500).json({ success: false, message: 'Errore durante il download' });
    }

    console.log('Download completato:', stdout);

    // URL pubblico del file
    const fileUrl = `https://loadnextback.onrender.com/downloads/${nomeFile}`;
    return res.json({ success: true, message: 'Download completato con successo', fileUrl });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server in ascolto su http://localhost:${PORT}`);
});
