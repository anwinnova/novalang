/**
 * NovaLang v2.0 Lexer / Tokenizer
 * Supports Core Programming, Web/DOM, HTTP, AI, and Motor/Hardware Automation Primitives.
 */

export const TokenType = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  VARIABLE: 'VARIABLE',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  OPERATOR: 'OPERATOR',
  PIPELINE: 'PIPELINE',
  PUNCTUATION: 'PUNCTUATION',
  NEWLINE: 'NEWLINE',
  EOF: 'EOF'
};

const KEYWORDS = new Set([
  // Core & Control Flow
  'set', 'if', 'else', 'repeat', 'times', 'while', 'for', 'in',
  'true', 'false', 'def', 'end', 'log', 'export', 'return', 'wait',
  // Web & Network
  'open', 'click', 'type', 'extract', 'http_get', 'http_post', 'ai',
  // Motor & Motion Hardware Automation
  'move_motor', 'rotate_servo', 'set_speed', 'gripper_state',
  'read_sensor', 'record_pose', 'replay_motion'
]);

export class Token {
  constructor(type, value, line, col) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.col = col;
  }
}

export class Lexer {
  constructor(input) {
    this.input = input || '';
    this.pos = 0;
    this.line = 1;
    this.col = 1;
  }

  peek() {
    return this.input[this.pos] || null;
  }

  advance() {
    const ch = this.peek();
    this.pos++;
    if (ch === '\n') {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return ch;
  }

  tokenize() {
    const tokens = [];

    while (this.pos < this.input.length) {
      const ch = this.peek();

      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.advance();
        continue;
      }

      // Comments
      if (ch === '#' || (ch === '/' && this.input[this.pos + 1] === '/')) {
        while (this.pos < this.input.length && this.peek() !== '\n') {
          this.advance();
        }
        continue;
      }

      // Newlines
      if (ch === '\n' || ch === ';') {
        const line = this.line, col = this.col;
        this.advance();
        if (tokens.length > 0 && tokens[tokens.length - 1].type !== TokenType.NEWLINE) {
          tokens.push(new Token(TokenType.NEWLINE, '\n', line, col));
        }
        continue;
      }

      // Variables ($varName)
      if (ch === '$') {
        const line = this.line, col = this.col;
        this.advance();
        let varName = '';
        while (this.peek() && /[a-zA-Z0-9_]/.test(this.peek())) {
          varName += this.advance();
        }
        tokens.push(new Token(TokenType.VARIABLE, varName, line, col));
        continue;
      }

      // Strings
      if (ch === '"' || ch === "'") {
        const quote = ch;
        const line = this.line, col = this.col;
        this.advance();
        let str = '';
        while (this.peek() !== null && this.peek() !== quote) {
          if (this.peek() === '\\') {
            this.advance();
            const esc = this.advance();
            if (esc === 'n') str += '\n';
            else if (esc === 't') str += '\t';
            else str += esc;
          } else {
            str += this.advance();
          }
        }
        if (this.peek() === quote) this.advance();
        tokens.push(new Token(TokenType.STRING, str, line, col));
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        const line = this.line, col = this.col;
        let numStr = '';
        while (this.peek() !== null && /[0-9.]/.test(this.peek())) {
          numStr += this.advance();
        }
        tokens.push(new Token(TokenType.NUMBER, parseFloat(numStr), line, col));
        continue;
      }

      // Pipeline operator `->`
      if (ch === '-' && this.input[this.pos + 1] === '>') {
        const line = this.line, col = this.col;
        this.advance(); this.advance();
        tokens.push(new Token(TokenType.PIPELINE, '->', line, col));
        continue;
      }

      // Multi-char operators
      if (['=', '!', '>', '<'].includes(ch) && this.input[this.pos + 1] === '=') {
        const line = this.line, col = this.col;
        const op = ch + this.advance();
        this.advance();
        tokens.push(new Token(TokenType.OPERATOR, op, line, col));
        continue;
      }

      // Single character operators
      if (['+', '-', '*', '/', '=', '>', '<'].includes(ch)) {
        const line = this.line, col = this.col;
        tokens.push(new Token(TokenType.OPERATOR, this.advance(), line, col));
        continue;
      }

      // Punctuation
      if (['(', ')', '{', '}', '[', ']', ',', ':'].includes(ch)) {
        const line = this.line, col = this.col;
        tokens.push(new Token(TokenType.PUNCTUATION, this.advance(), line, col));
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_]/.test(ch)) {
        const line = this.line, col = this.col;
        let ident = '';
        while (this.peek() !== null && /[a-zA-Z0-9_]/.test(this.peek())) {
          ident += this.advance();
        }

        if (ident === 'true' || ident === 'false') {
          tokens.push(new Token(TokenType.BOOLEAN, ident === 'true', line, col));
        } else if (KEYWORDS.has(ident)) {
          tokens.push(new Token(TokenType.KEYWORD, ident, line, col));
        } else {
          tokens.push(new Token(TokenType.IDENTIFIER, ident, line, col));
        }
        continue;
      }

      this.advance();
    }

    tokens.push(new Token(TokenType.EOF, null, this.line, this.col));
    return tokens;
  }
}
