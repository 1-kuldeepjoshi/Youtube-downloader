from flask import Flask, request, send_file, jsonify
import subprocess
import os
import uuid

app = Flask(__name__)
DOWNLOAD_DIR = "downloads"

if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

@app.route("/download", methods=["GET"])
def download():
    url = request.args.get("url")
    format = request.args.get("format", "mp4")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    file_id = str(uuid.uuid4())
    output_template = os.path.join(DOWNLOAD_DIR, f"{file_id}.%(ext)s")

    if format == "mp3":
        cmd = ["yt-dlp", "--extract-audio", "--audio-format", "mp3", "-o", output_template, url]
    else:
        cmd = ["yt-dlp", "-f", "best", "-o", output_template, url]

    subprocess.run(cmd)

    # Find the downloaded file
    for f in os.listdir(DOWNLOAD_DIR):
        if f.startswith(file_id):
            return send_file(os.path.join(DOWNLOAD_DIR, f), as_attachment=True)

    return jsonify({"error": "Download failed"}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)

