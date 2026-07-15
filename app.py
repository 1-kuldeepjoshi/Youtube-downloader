import os
from flask import Flask, render_template, request, send_file, jsonify
import yt_dlp

app = Flask(__name__)

# Route to serve the frontend UI
@app.route('/')
def index():
    return render_template('index.html')

# Route to process and download the media
@app.route('/download', methods=['POST'])
def download():
    data = request.json
    url = data.get('url')
    format_type = data.get('format') # 'mp3' or 'mp4'

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    # Clean up old files to prevent Render's tiny ephemeral disk from filling up
    for f in os.listdir('.'):
        if f.endswith('.mp3') or f.endswith('.mp4'):
            try:
                os.remove(f)
            except Exception:
                pass

    ydl_opts = {
        'outtmpl': 'downloaded_media.%(ext)s',
        'quiet': True,
        'no_warnings': True,
    }

    if format_type == 'mp3':
        ydl_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        })
        expected_file = 'downloaded_media.mp3'
        mimetype = 'audio/mpeg'
    else:
        ydl_opts.update({
            'format': 'best[ext=mp4]/best',
        })
        expected_file = 'downloaded_media.mp4'
        mimetype = 'video/mp4'

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        if os.path.exists(expected_file):
            return send_file(
                expected_file, 
                as_attachment=True, 
                download_name=f"download.{format_type}", 
                mimetype=mimetype
            )
        else:
            return jsonify({'error': 'File generation failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Render assigns a port dynamically via the PORT environment variable
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
