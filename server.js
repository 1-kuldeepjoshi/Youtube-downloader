const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/api/convert', async (req, res) => {
    const { url, format } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const isAudio = format === 'mp3';

    try {
        // We use a public API to handle the extraction, bypassing Render's IP ban
        const apiUrl = `https://api.socialdownloaders.com/v1/social/autolink?url=${encodeURIComponent(url)}&format=${isAudio ? 'mp3' : '720'}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data && data.url) {
            // Send the direct download link back to the frontend
            res.json({ success: true, downloadUrl: data.url });
        } else {
            throw new Error('API failed to extract the video.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: 'Conversion failed', 
            details: 'Could not bypass YouTube security. Try again later.' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App running on port ${PORT}`));
