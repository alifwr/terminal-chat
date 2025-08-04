FROM kalilinux/kali-rolling:latest

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Fix Kali repositories and install all packages
RUN echo "deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware" > /etc/apt/sources.list && \
    apt clean && \
    apt update --fix-missing && \
    apt install -y --no-install-recommends \
    kali-linux-headless \
    openssh-server \
    curl \
    wget \
    git \
    sudo \
    nano \
    nodejs \
    npm \
    procps \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

# Verify Node.js installation
RUN node --version && npm --version

# Create a non-root user for better security
RUN useradd -m -s /bin/bash kaliuser && \
    echo "kaliuser:kaliuser" | chpasswd && \
    usermod -aG sudo kaliuser && \
    echo "kaliuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Configure SSH (no systemd required)
RUN echo 'root:toor' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/UsePAM yes/UsePAM no/' /etc/ssh/sshd_config && \
    echo "AllowUsers root kaliuser" >> /etc/ssh/sshd_config

# Generate SSH host keys
RUN ssh-keygen -A

# Create startup script
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Switch to kaliuser
USER kaliuser
WORKDIR /home/kaliuser

# Switch back to root for final setup
USER root

# Expose ports
EXPOSE 22

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/start.sh"]