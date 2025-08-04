import { program } from 'commander';
import { MCPServer } from './mcp-server/index.js';
import { WebTerminalServer } from './web-terminal/index.js';
import { updateConfig } from './mcp-server/config.js';

class UnifiedTerminalServer {
  constructor() {
    this.mcpServer = null;
    this.webTerminalServer = null;
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    const gracefulShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down services...`);
      
      if (this.mcpServer) {
        console.log('Stopping MCP Server...');
        await this.mcpServer.stop();
      }
      
      if (this.webTerminalServer) {
        console.log('Stopping Web Terminal Server...');
        await this.webTerminalServer.stop();
      }
      
      console.log('All services stopped. Goodbye!');
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  }

  async startMCP() {
    console.log('🔧 Starting MCP Server...');
    this.mcpServer = new MCPServer(this.webTerminalServer.invokeTerminal.bind(this.webTerminalServer));
    // this.mcpServer = new MCPServer();
    await this.mcpServer.start();
  }

  async startWebTerminal(port = 8080) {
    console.log(`🌐 Starting Web Terminal Server on port ${port}...`);
    this.webTerminalServer = new WebTerminalServer(port);
    await this.webTerminalServer.start();
  }

  async startBoth(webPort = 8080) {
    console.log('🚀 Starting both MCP and Web Terminal servers...');
    
    // Start Web Terminal first
    await this.startWebTerminal(webPort);
    console.log('✅ Web Terminal server initialized successfully');
    
    // Then start MCP server
    await this.startMCP();
    console.log('✅ MCP server initialized successfully');
    
    console.log('🎉 Both servers are running and ready!');
  }
}

// CLI Setup
program
  .name('unified-terminal')
  .description('Unified terminal server with MCP and Web SSH capabilities')
  .version('1.0.0');

program
  .command('mcp')
  .description('Start only the MCP server for Claude Desktop')
  .action(async () => {
    const server = new UnifiedTerminalServer();
    await server.startMCP();
  });

program
  .command('web')
  .description('Start only the Web Terminal server')
  .option('-p, --port <port>', 'Port for web terminal server', '8080')
  .action(async (options) => {
    const server = new UnifiedTerminalServer();
    await server.startWebTerminal(parseInt(options.port));
  });

program
  .command('both')
  .description('Start both MCP and Web Terminal servers')
  .option('-p, --port <port>', 'Port for web terminal server', '8080')
  .action(async (options) => {
    const server = new UnifiedTerminalServer();
    await server.startBoth(parseInt(options.port));
  });

program
  .command('config')
  .description('Configure Claude Desktop for MCP server')
  .option('-d, --debug', 'Enable debug mode')
  .action((options) => {
    updateConfig(options.debug);
  });

// Default behavior - show help or start based on legacy args
if (process.argv.length === 2) {
  program.help();
} else {
  // Handle legacy arguments for backward compatibility
  const args = process.argv.slice(2);
  
  if (args.includes('config')) {
    const debug = args.includes('--debug');
    updateConfig(debug);
  } else if (args.includes('--mcp')) {
    const server = new UnifiedTerminalServer();
    server.startMCP();
  } else if (args.includes('--web')) {
    const server = new UnifiedTerminalServer();
    const portIndex = args.indexOf('--port');
    const port = portIndex !== -1 ? parseInt(args[portIndex + 1]) : 8080;
    server.startWebTerminal(port);
  } else if (args.includes('--both')) {
    const server = new UnifiedTerminalServer();
    const portIndex = args.indexOf('--port');
    const port = portIndex !== -1 ? parseInt(args[portIndex + 1]) : 8080;
    server.startBoth(port);
  } else {
    program.parse();
  }
}