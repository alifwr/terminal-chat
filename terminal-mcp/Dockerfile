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
    procps

RUN apt install -y \
    kali-desktop-xfce \
    kali-linux-large \
    tightvncserver \
    net-tools \
    dbus-x11 \
    novnc \
    dbus \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

ENV USER=root
ENV VNCEXPOSE=0
ENV VNCPORT=5900
ENV VNCPWD=changeme
ENV VNCDISPLAY=1200x680
ENV VNCDEPTH=16
ENV NOVNCPORT=8080

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json .

# Install dependencies
RUN npm install

# Create a non-root user for better security
# RUN useradd -m -s /bin/bash kaliuser && \
#     echo "kaliuser:kaliuser" | chpasswd && \
#     usermod -aG sudo kaliuser && \
#     echo "kaliuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Copy source code
COPY . .

# Create a non-root user
# USER kaliuser

# Expose ports
EXPOSE 22 8090 8000 5900 8080

RUN which npm
RUN ls /app/package.json

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]

# # Start command
# CMD ["npm", "start"]
# CMD ["npx", "-y", "supergateway", "--stdio", "\"node", "src/index.js", "--both\"", "--port", "8000", "--baseUrl", "http://localhost:8000", "--ssePath", "/sse", "--messagePath", "/message"]