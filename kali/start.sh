#!/bin/bash

# Function to check if a service is running
check_service() {
    if pgrep "$1" > /dev/null; then
        echo "$1 is running"
        return 0
    else
        echo "$1 is not running"
        return 1
    fi
}

# Generate SSH host keys if they don't exist
echo "Generating SSH host keys if needed..."
ssh-keygen -A

# Start SSH service
echo "Starting SSH service..."
/usr/sbin/sshd -D &
SSHD_PID=$!

sleep 3

# Verify SSH is running
if check_service "sshd"; then
    echo "SSH service started successfully (PID: $SSHD_PID)"
else
    echo "Warning: SSH service may not be running properly"
fi

# Display connection information
echo "=================================="
echo "Kali Linux Container is ready!"
echo "=================================="
echo "SSH Access:"
echo "  - Root user: root / toor"
echo "  - Regular user: kaliuser / kaliuser"
echo "  - SSH Port: 22 (mapped to host port 2222)"
echo "=================================="

# Set trap for cleanup
trap cleanup SIGTERM SIGINT

# Keep container running and monitor services
echo "Container is running. Press Ctrl+C to stop."
while true; do
    sleep 30
    
    # Check if SSH is still running
    if ! check_service "sshd"; then
        echo "SSH service died, restarting..."
        /usr/sbin/sshd -D &
        SSHD_PID=$!
    fi
done