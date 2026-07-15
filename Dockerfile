# Switching to bookworm-slim ensures apt-get installs Python 3.11+
FROM node:20-bookworm-slim

# Install Python 3.11, FFmpeg, and curl
RUN apt-get update && apt-get install -y ffmpeg python3 curl

# Download the latest yt-dlp binary directly
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Set up the Node.js application
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]
