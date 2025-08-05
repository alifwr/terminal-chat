# Use Ubuntu as base image since we need to install native dependencies for node-pty
FROM kalilinux/kali-rolling:latest

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Fix Kali repositories and install all packages
RUN echo "deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware" > /etc/apt/sources.list && \
    apt clean && \
    apt update --fix-missing && \
    apt install -y --no-install-recommends \
    kali-linux-headless \
    build-essential \
    openssh-server \
    python3 \
    gnupg \
    curl \
    wget \
    npm \
    git \
    sudo \
    nano \
    nodejs \
    procps \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json .

# Install dependencies
RUN npm install

# # Create startup script
# COPY start.sh /usr/local/bin/start.sh
# RUN chmod +x /usr/local/bin/start.sh

# Create a non-root user for better security
RUN useradd -m -s /bin/bash kaliuser && \
    echo "kaliuser:kaliuser" | chpasswd && \
    usermod -aG sudo kaliuser && \
    echo "kaliuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Copy source code
COPY . .

# Create a non-root user
USER kaliuser

# Expose ports
EXPOSE 22 8080 8000

RUN which npm
RUN ls /app/package.json

# Set the entrypoint
# ENTRYPOINT ["/usr/local/bin/start.sh"]

# # Start command
CMD ["npm", "start"]
# CMD ["npx", "-y", "supergateway", "--stdio", "\"node", "src/index.js", "--both\"", "--port", "8000", "--baseUrl", "http://localhost:8000", "--ssePath", "/sse", "--messagePath", "/message"]