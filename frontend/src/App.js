import React, { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("mp4");

  const handleDownload = () => {
    fetch(`http://localhost:5000/download?url=${encodeURIComponent(url)}&format=${format}`)
      .then(response => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error("Download failed");
      })
      .then(blob => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `video.${format}`;
        link.click();
      })
      .catch(err => alert(err.message));
  };

  return (
    <div className="container">
      <h1>YouTube Downloader</h1>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div>
        <label>
          <input type="radio" value="mp4" checked={format === "mp4"} onChange={() => setFormat("mp4")} />
          MP4
        </label>
        <label>
          <input type="radio" value="mp3" checked={format === "mp3"} onChange={() => setFormat("mp3")} />
          MP3
        </label>
      </div>
      <button onClick={handleDownload}>Download</button>
    </div>
  );
}

export default App;
