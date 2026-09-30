/**
 * NovaLang v2.0 AST Parser
 * Parses token stream into Abstract Syntax Tree nodes for NovaLang scripts.
 */

import { TokenType } from './lexer.js';

export class ASTNode {
  constructor(type, props = {}) {
    this.type = type;
    Object.assign(this, props);
  }
}

export class Parser {
  constructor(tokens) {
    this.tokens = tokens || [];
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos] || null;
  }

  advance() {
    const token = this.peek();
    if (token && token.type !== TokenType.EOF) {
      this.pos++;
    }
    return token;
  }

  match(type, value = null) {
    const token = this.peek();
    if (!token) return false;
    if (token.type !== type) return false;
    if (value !== null && token.value !== value) return false;
    return true;
  }

  consume(type, value = null, errorMsg = '') {
    if (this.match(type, value)) {
      return this.advance();
    }
    const current = this.peek();
    throw new SyntaxError(
      errorMsg || `Unexpected token '${current ? current.value : 'EOF'}' at line ${current ? current.line : 'end'}`
    );
  }

  skipNewlines() {
    while (this.match(TokenType.NEWLINE)) {
      this.advance();
    }
  }

  parse() {
    const statements = [];
    this.skipNewlines();

    while (!this.match(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
      this.skipNewlines();
    }

    return new ASTNode('Program', { body: statements });
  }

  parseStatement() {
    this.skipNewlines();
    if (this.match(TokenType.EOF)) return null;

    if (this.match(TokenType.KEYWORD, 'set')) {
      return this.parseAssignment();
    }
    if (this.match(TokenType.VARIABLE) && this.peekAhead(1)?.value === '=') {
      return this.parseAssignment();
    }
    if (this.match(TokenType.KEYWORD, 'if')) {
      return this.parseIf();
    }
    if (this.match(TokenType.KEYWORD, 'repeat')) {
      return this.parseRepeat();
    }

    return this.parsePipelineOrCommand();
  }

  peekAhead(offset) {
    return this.tokens[this.pos + offset] || null;
  }

  parseAssignment() {
    if (this.match(TokenType.KEYWORD, 'set')) {
      this.advance();
    }

    const varToken = this.consume(TokenType.VARIABLE, null, 'Expected variable name starting with $');
    this.consume(TokenType.OPERATOR, '=', "Expected '=' in assignment");

    const expr = this.parsePipelineOrCommand();
    return new ASTNode('AssignmentStatement', {
      variable: varToken.value,
      value: expr
    });
  }

  parseIf() {
    this.consume(TokenType.KEYWORD, 'if');
    const condition = this.parseExpression();
    this.skipNewlines();

    const consequent = [];
    while (!this.match(TokenType.KEYWORD, 'else') && !this.match(TokenType.KEYWORD, 'end') && !this.match(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) consequent.push(stmt);
      this.skipNewlines();
    }

    let alternate = [];
    if (this.match(TokenType.KEYWORD, 'else')) {
      this.advance();
      this.skipNewlines();
      while (!this.match(TokenType.KEYWORD, 'end') && !this.match(TokenType.EOF)) {
        const stmt = this.parseStatement();
        if (stmt) alternate.push(stmt);
        this.skipNewlines();
      }
    }

    this.consume(TokenType.KEYWORD, 'end', "Expected 'end' to close if statement");

    return new ASTNode('IfStatement', {
      condition,
      consequent,
      alternate
    });
  }

  parseRepeat() {
    this.consume(TokenType.KEYWORD, 'repeat');
    const countExpr = this.parseExpression();
    if (this.match(TokenType.KEYWORD, 'times')) {
      this.advance();
    }
    this.skipNewlines();

    const body = [];
    while (!this.match(TokenType.KEYWORD, 'end') && !this.match(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
      this.skipNewlines();
    }

    this.consume(TokenType.KEYWORD, 'end', "Expected 'end' to close repeat statement");

    return new ASTNode('RepeatStatement', {
      count: countExpr,
      body
    });
  }

  parsePipelineOrCommand() {
    let left = this.parseCommand();

    while (this.match(TokenType.PIPELINE)) {
      this.advance();
      const right = this.parseCommand();
      left = new ASTNode('PipelineStatement', {
        left,
        right
      });
    }

    return left;
  }

  parseCommand() {
    const token = this.peek();
    if (!token) return null;

    let commandName = '';
    if (token.type === TokenType.KEYWORD || token.type === TokenType.IDENTIFIER) {
      commandName = token.value;
      this.advance();
    } else {
      return this.parseExpression();
    }

    const args = [];
    while (
      this.peek() &&
      this.peek().type !== TokenType.NEWLINE &&
      this.peek().type !== TokenType.PIPELINE &&
      this.peek().type !== TokenType.EOF &&
      !['else', 'end'].includes(this.peek().value)
    ) {
      args.push(this.parseExpression());
    }

    return new ASTNode('CommandStatement', {
      name: commandName,
      args
    });
  }

  parseExpression() {
    let left = this.parsePrimary();

    if (this.match(TokenType.OPERATOR)) {
      const op = this.advance().value;
      const right = this.parsePrimary();
      return new ASTNode('BinaryExpression', {
        operator: op,
        left,
        right
      });
    }

    return left;
  }

  parsePrimary() {
    const token = this.peek();
    if (!token) return null;

    if (token.type === TokenType.STRING) {
      this.advance();
      return new ASTNode('Literal', { value: token.value, rawType: 'string' });
    }
    if (token.type === TokenType.NUMBER) {
      this.advance();
      return new ASTNode('Literal', { value: token.value, rawType: 'number' });
    }
    if (token.type === TokenType.BOOLEAN) {
      this.advance();
      return new ASTNode('Literal', { value: token.value, rawType: 'boolean' });
    }
    if (token.type === TokenType.VARIABLE) {
      this.advance();
      return new ASTNode('Variable', { name: token.value });
    }
    if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      return new ASTNode('Identifier', { name: token.value });
    }

    if (this.match(TokenType.PUNCTUATION, '(')) {
      this.advance();
      const expr = this.parseExpression();
      this.consume(TokenType.PUNCTUATION, ')', "Expected ')'");
      return expr;
    }

    throw new SyntaxError(`Unexpected token in expression: '${token.value}' at line ${token.line}`);
  }
}
