const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.static('public'));
app.use(express.json());

app.post('/api/convert', (req, res) => {
    const { url, format } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const fileId = uuidv4();
    const isAudio = format === 'mp3';
    
    // Save to Linux temporary directory
    const outputTemplate = `/tmp/${fileId}.%(ext)s`;
    
    // Injecting the client spoofing bypasses
    let args = [
        '--rm-cache-dir',
        '--extractor-args', 'youtube:player_client=tv_downgraded,web_embedded,android_vr',
        '-o', outputTemplate,
        '--no-playlist'
    ];

    if (isAudio) {
        args.push('-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3');
    } else {
        args.push('-f', 'bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4][height<=720]/best');
    }
    
    args.push(url);

    const ytProcess = spawn('yt-dlp', args);
    let errorLog = '';

    ytProcess.stderr.on('data', (data) => {
        errorLog += data.toString();
    });

    ytProcess.on('close', (code) => {
        if (code !== 0) {
            console.error('yt-dlp failed:', errorLog);
            return res.status(500).json({ 
                error: 'Conversion failed on the server.', 
                details: errorLog.includes('Sign in') ? 'Bot detection blocked the request.' : 'Media processing error.' 
            });
        }
        
        // Find the generated file (yt-dlp determines final extension)
        fs.readdir('/tmp', (err, files) => {
            if (err) return res.status(500).json({ error: 'Failed to access storage' });
            
            const downloadedFile = files.find(f => f.startsWith(fileId));
            if (!downloadedFile) return res.status(500).json({ error: 'File missing after conversion.' });
            
            res.json({ success: true, downloadUrl: `/api/download/${downloadedFile}` });
        });
    });
});

app.get('/api/download/:filename', (req, res) => {
    const filepath = path.join('/tmp', req.params.filename);
    
    if (fs.existsSync(filepath)) {
        res.download(filepath, (err) => {
            if (err) console.error('Download error:', err);
            // Cleanup file instantly to preserve server space
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        });
    } else {
        res.status(404).send('File not found or link expired.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App running on port ${PORT}`));
