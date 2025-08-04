// src/mcp-server/config.js
import fs from 'fs';
import path from 'path';
import os from 'os';

function getConfigPath() {
    switch (process.platform) {
        case 'darwin':
            return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
        case 'win32':
            return path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
        default:
            throw new Error('Unsupported platform');
    }
}

export function updateConfig(debug = false) {
    const isNpx = Boolean(
        process.argv[1].includes('/_npx/') ||
        process.env.npm_command === 'exec' ||
        process.env._?.includes('/_npx/')
    );

    if (!isNpx && !debug) {
        console.error('⚠️  Warning: Not running via npx. Use --debug flag to override.');
        return;
    }

    const scriptPath = process.argv[1];
    const configPath = getConfigPath();

    try {
        let config = {};
        
        // Try to read existing config
        try {
            const configContent = fs.readFileSync(configPath, 'utf8');
            config = JSON.parse(configContent);
            console.log('📖 Found existing Claude Desktop config');
        } catch (err) {
            console.log('📝 Creating new Claude Desktop config file');
        }

        // Initialize mcpServers if it doesn't exist
        config.mcpServers = config.mcpServers || {};

        // Configure the unified terminal server
        const serverName = 'unified-terminal-server';
        
        if (process.platform === 'win32') {
            config.mcpServers[serverName] = {
                command: "C:\\Program Files\\nodejs\\node.exe",
                args: [scriptPath, 'mcp']
            };
        } else {
            config.mcpServers[serverName] = {
                command: debug ? 'node' : 'npx',
                args: debug ? [scriptPath, 'mcp'] : ['unified-terminal', 'mcp']
            };
        }

        // Ensure config directory exists
        const configDir = path.dirname(configPath);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
            console.log(`📁 Created config directory: ${configDir}`);
        }

        // Write updated config
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        console.log('✅ Claude Desktop configuration updated successfully!');
        console.log(`📍 Config file: ${configPath}`);
        console.log(`🔧 Server name: ${serverName}`);
        console.log(`🚀 Command: ${config.mcpServers[serverName].command} ${config.mcpServers[serverName].args.join(' ')}`);
        console.log('\n📋 Next steps:');
        console.log('1. Restart Claude Desktop');
        console.log('2. The MCP server will be available as a tool in Claude Desktop');
        
    } catch (err) {
        console.error('❌ Error updating Claude Desktop config:', err.message);
        process.exit(1);
    }
}

// Utility function to remove the server from config
export function removeConfig() {
    const configPath = getConfigPath();
    
    try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        if (config.mcpServers && config.mcpServers['unified-terminal-server']) {
            delete config.mcpServers['unified-terminal-server'];
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('✅ Unified terminal server removed from Claude Desktop config');
        } else {
            console.log('ℹ️  Unified terminal server not found in config');
        }
    } catch (err) {
        console.error('❌ Error removing from Claude Desktop config:', err.message);
    }
}

// Utility function to check current config status
export function checkConfig() {
    const configPath = getConfigPath();
    
    try {
        if (!fs.existsSync(configPath)) {
            console.log('❌ Claude Desktop config file not found');
            console.log(`Expected location: ${configPath}`);
            return false;
        }
        
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        if (config.mcpServers && config.mcpServers['unified-terminal-server']) {
            console.log('✅ Unified terminal server is configured in Claude Desktop');
            console.log('Configuration:', config.mcpServers['unified-terminal-server']);
            return true;
        } else {
            console.log('❌ Unified terminal server not found in Claude Desktop config');
            return false;
        }
    } catch (err) {
        console.error('❌ Error checking Claude Desktop config:', err.message);
        return false;
    }
}