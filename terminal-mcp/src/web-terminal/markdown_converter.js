/**
 * Converts raw terminal output with ANSI escape codes to markdown format
 * @param {string} rawTerminal - Raw terminal output with ANSI codes
 * @param {Object} options - Configuration options
 * @returns {string} - Formatted markdown string
 */
function terminalToMarkdown(rawTerminal, options = {}) {
  const {
    preserveColors = false,
    codeBlock = true,
    language = 'bash',
    cleanPrompts = true
  } = options;

  let text = rawTerminal;

  // Remove common terminal control sequences
  const controlSequences = [
    /\u001b\[\?2004[lh]/g,           // Bracketed paste mode
    /\u001b\]0;[^\u0007]*\u0007/g,   // Window title sequences
    /\u001b\[\d*[ABCD]/g,           // Cursor movement
    /\u001b\[2J/g,                  // Clear screen
    /\u001b\[H/g,                   // Cursor home
    /\u001b\[\d*;\d*[Hf]/g,         // Cursor position
    /\u001b\[K/g,                   // Clear line
    /\u001b\[\?25[lh]/g,            // Show/hide cursor
    /\u001b\[\?\d+[lh]/g,           // Various terminal modes
  ];

  // Remove control sequences
  controlSequences.forEach(regex => {
    text = text.replace(regex, '');
  });

  // Handle ANSI color and formatting codes
  if (preserveColors) {
    // Convert ANSI codes to markdown-like formatting
    text = convertAnsiToMarkdown(text);
  } else {
    // Remove all ANSI escape sequences
    text = text.replace(/\u001b\[[0-9;]*m/g, '');
  }

  // Clean up carriage returns and normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Remove excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  if (cleanPrompts) {
    // Clean up common shell prompts and decorative elements
    text = text.replace(/^[┌└─│]+.*?[$#]\s*/gm, '$ ');
    text = text.replace(/^.*?[$#]\s+/gm, '$ ');
  }

  // Trim whitespace
  text = text.trim();

  // Wrap in code block if requested
  if (codeBlock) {
    return `\`\`\`${language}\n${text}\n\`\`\``;
  }

  return text;
}

/**
 * Converts ANSI escape codes to markdown formatting
 * @param {string} text - Text with ANSI codes
 * @returns {string} - Text with markdown formatting
 */
function convertAnsiToMarkdown(text) {
  // Stack to keep track of open formatting
  const formatStack = [];
  let result = '';
  let i = 0;

  // ANSI color mappings
  const colors = {
    30: 'black', 31: 'red', 32: 'green', 33: 'yellow',
    34: 'blue', 35: 'magenta', 36: 'cyan', 37: 'white',
    90: 'bright-black', 91: 'bright-red', 92: 'bright-green',
    93: 'bright-yellow', 94: 'bright-blue', 95: 'bright-magenta',
    96: 'bright-cyan', 97: 'bright-white'
  };

  while (i < text.length) {
    if (text[i] === '\u001b' && text[i + 1] === '[') {
      // Find the end of the escape sequence
      let j = i + 2;
      while (j < text.length && text[j] !== 'm') {
        j++;
      }
      
      if (j < text.length) {
        const codes = text.substring(i + 2, j).split(';').map(Number);
        
        codes.forEach(code => {
          switch (code) {
            case 0: // Reset
              // Close all open formatting
              while (formatStack.length > 0) {
                const format = formatStack.pop();
                result += format.close;
              }
              break;
            case 1: // Bold
              formatStack.push({ open: '**', close: '**' });
              result += '**';
              break;
            case 3: // Italic
              formatStack.push({ open: '_', close: '_' });
              result += '_';
              break;
            case 4: // Underline
              formatStack.push({ open: '<u>', close: '</u>' });
              result += '<u>';
              break;
            default:
              if (colors[code]) {
                const colorName = colors[code];
                formatStack.push({ 
                  open: `<span style="color: ${colorName}">`, 
                  close: '</span>' 
                });
                result += `<span style="color: ${colorName}">`;
              }
          }
        });
        
        i = j + 1;
      } else {
        result += text[i];
        i++;
      }
    } else {
      result += text[i];
      i++;
    }
  }

  // Close any remaining open formatting
  while (formatStack.length > 0) {
    const format = formatStack.pop();
    result += format.close;
  }

  return result;
}

/**
 * Extract just the command output, removing prompts and commands
 * @param {string} rawTerminal - Raw terminal output
 * @returns {string} - Clean output
 */
function extractOutput(rawTerminal) {
  const lines = rawTerminal.split(/\r?\n/);
  const outputLines = [];
  let foundCommand = false;

  for (const line of lines) {
    // Skip empty lines and control sequences
    if (!line.trim() || line.includes('\u001b[')) continue;
    
    // Skip lines that look like shell prompts
    if (line.match(/^.*?[$#]\s+/) && !foundCommand) {
      foundCommand = true;
      continue;
    }
    
    if (foundCommand) {
      outputLines.push(line);
    }
  }

  return outputLines.join('\n').trim();
}

// // Example usage:
// const rawTerminal = `ls\\r\\n\\u001b[?2004l\\rfibonacci.py  \\u001b[0m\\u001b[01;34mnode_modules\\u001b[0m  package-lock.json  package.json\\r\\n\\r\\n\\u001b[?2004h\\u001b]0;kaliuser@9f6763a6dd88: ~\\u0007\\u001b[;32m┌──(\\u001b[1;34mkaliuser㉿9f6763a6dd88\\u001b[;32m)-[\\u001b[0;1m~\\u001b[;32m]\\r\\r\\n\\u001b[;32m└─\\u001b[1;34m$\\u001b[0m `;

// // Convert the raw string (handle escaped characters)
// const processedInput = rawTerminal.replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\u001b/g, '\u001b');

// console.log('=== Basic Conversion ===');
// console.log(terminalToMarkdown(processedInput));

// console.log('\n=== With Colors Preserved ===');
// console.log(terminalToMarkdown(processedInput, { preserveColors: true }));

// console.log('\n=== Just Output ===');
// console.log(terminalToMarkdown(extractOutput(processedInput)));

// Export the functions
module.exports = {
  terminalToMarkdown,
  convertAnsiToMarkdown,
  extractOutput
};