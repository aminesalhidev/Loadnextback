const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5003;

app.use(cors());
app.use(bodyParser.json());

// Percorso all'eseguibile yt-dlp
const ytDlpPath = path.join(__dirname, 'yt-dlp_linux');

// Percorso file cookies.txt (se esiste)
const cookiesPath = path.join(__dirname, 'cookies.txt');

app.post('/scarica', (req, res) => {
  const { link } = req.body;

  if (!link) {
    return res.status(400).json({ errore: 'Link mancante' });
  }

  console.log(`Il server ha ricevuto il link ${link}`);

  const outputPath = path.join(__dirname, 'video_scaricato.%(ext)s');
  let command = `${ytDlpPath} -f best -o "${outputPath}"`;

  // Aggiunge i cookies se disponibili
  if (fs.existsSync(cookiesPath)) {
    command += ` --cookies "${cookiesPath}"`;
    console.log('✔️ Cookie rilevati, usati per il download');
  } else {
    console.log('⚠️ Nessun cookie rilevato, download pubblico');
  }

  command += ` "${link}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Errore: ${error.message}`);
      return res.status(500).json({ errore: 'Errore durante il download' });
    }

    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);

    res.status(200).json({ messaggio: 'Download completato con successo' });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
