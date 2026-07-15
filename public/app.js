async function convertVideo() {
    const videoUrl = document.getElementById('videoUrl').value.trim();
    const format = document.getElementById('format').value;
    const btn = document.getElementById('btn');
    const statusDiv = document.getElementById('status');
    const resultDiv = document.getElementById('result');
    const downloadLink = document.getElementById('downloadLink');

    if (!videoUrl) return alert('Please paste a valid YouTube URL');

    btn.disabled = true;
    btn.innerText = 'Extracting... (This can take 15-30 seconds)';
    statusDiv.classList.remove('hidden', 'text-red-400');
    statusDiv.classList.add('text-slate-300');
    statusDiv.innerText = 'Bypassing security and processing media...';
    resultDiv.classList.add('hidden');

    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: videoUrl, format })
        });
        
        const data = await response.json();

        if (data.success) {
            statusDiv.innerText = 'Conversion successful!';
            statusDiv.classList.add('text-green-400');
            downloadLink.href = data.downloadUrl;
            resultDiv.classList.remove('hidden');
        } else {
            throw new Error(data.error || 'Conversion failed');
        }
    } catch (error) {
        statusDiv.classList.add('text-red-400');
        statusDiv.innerText = error.message;
    } finally {
        btn.disabled = false;
        btn.innerText = 'Convert Video';
    }
}
