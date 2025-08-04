#!/bin/bash

# Set working directory
cd /home/kaliuser

# Wait a moment for system to fully initialize
sleep 5

echo "Starting MCP service with supergateway..."
echo "Using locally installed packages..."

# Check if local packages exist
if [ -f "./node_modules/.bin/supergateway" ] && [ -f "./node_modules/.bin/mcp-shell" ]; then
    echo "✓ Found locally installed MCP packages"
    echo "Starting MCP service..."
    
    # Run with local packages
    exec node ./node_modules/.bin/supergateway --stdio "node ./node_modules/.bin/mcp-shell" --port 8000 --baseUrl http://localhost:8000 --ssePath /sse --messagePath /message
else
    echo "✗ Local packages not found, installing now..."
    
    # Install packages if they don't exist
    npm install supergateway mcp-shell --no-optional --no-audit --no-fund
    
    if [ -f "./node_modules/.bin/supergateway" ]; then
        echo "✓ Packages installed successfully"
        echo "Starting MCP service..."
        exec node ./node_modules/.bin/supergateway --stdio "node ./node_modules/.bin/mcp-shell" --port 8000 --baseUrl http://localhost:8000 --ssePath /sse --messagePath /message
    else
        echo "✗ Failed to install MCP packages"
        echo "Debug information:"
        ls -la ./node_modules/.bin/ 2>/dev/null || echo "node_modules/.bin does not exist"
        echo "Keeping container running for debugging..."
        sleep infinity
    fi
fi