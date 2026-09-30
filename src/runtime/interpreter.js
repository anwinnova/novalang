/**
 * NovaLang v2.0 Interpreter Runtime Engine
 * Asynchronously executes AST nodes with scoped state management, step debugging, and event hooks.
 */

import { StandardLibrary } from './stdlib.js';

export class Interpreter {
  constructor(options = {}) {
    this.variables = new Map();
    this.stdlib = new StandardLibrary(this);
    this.pipelineInput = null;
    this.onLog = options.onLog || console.log;
    this.onEvent = options.onEvent || (() => {});
    this.onStep = options.onStep || null;
    this.shouldStop = false;
    this.stepDelay = options.stepDelay || 0;
  }

  setVariable(name, value) {
    this.variables.set(name, value);
    this.emitEvent('variable_changed', { name, value });
  }

  getVariable(name) {
    if (this.variables.has(name)) {
      return this.variables.get(name);
    }
    return undefined;
  }

  getPipelineInput() {
    return this.pipelineInput;
  }

  log(message, type = 'info') {
    this.onLog({ message, type, timestamp: new Date().toLocaleTimeString() });
  }

  emitEvent(event, data) {
    this.onEvent({ event, data });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async execute(ast) {
    this.shouldStop = false;
    this.log('[Runtime] Initializing NovaLang Engine v2.0...', 'system');

    if (!ast || ast.type !== 'Program') {
      throw new Error(`Invalid AST root node '${ast ? ast.type : 'null'}'. Expected 'Program'.`);
    }

    let result = null;
    for (const stmt of ast.body) {
      if (this.shouldStop) break;
      result = await this.visit(stmt);
    }

    this.log('[Runtime] Execution finished successfully.', 'success');
    return result;
  }

  stop() {
    this.shouldStop = true;
    this.log('[Runtime] Execution stopped by user.', 'warning');
  }

  async visit(node) {
    if (!node) return null;

    if (this.onStep) {
      await this.onStep(node);
    }
    if (this.stepDelay > 0) {
      await this.delay(this.stepDelay);
    }

    switch (node.type) {
      case 'Program':
        let res = null;
        for (const stmt of node.body) {
          if (this.shouldStop) break;
          res = await this.visit(stmt);
        }
        return res;

      case 'AssignmentStatement':
        const val = await this.visit(node.value);
        this.setVariable(node.variable, val);
        this.log(`Set $${node.variable} = ${JSON.stringify(val)}`, 'system');
        return val;

      case 'IfStatement':
        const cond = await this.visit(node.condition);
        if (cond) {
          let ifRes = null;
          for (const s of node.consequent) {
            if (this.shouldStop) break;
            ifRes = await this.visit(s);
          }
          return ifRes;
        } else if (node.alternate && node.alternate.length > 0) {
          let elseRes = null;
          for (const s of node.alternate) {
            if (this.shouldStop) break;
            elseRes = await this.visit(s);
          }
          return elseRes;
        }
        return null;

      case 'RepeatStatement':
        const count = await this.visit(node.count);
        const total = typeof count === 'number' ? Math.floor(count) : 1;
        let lastRepeatRes = null;

        for (let i = 0; i < total; i++) {
          if (this.shouldStop) break;
          this.log(`[Loop] Repeat iteration ${i + 1} of ${total}`, 'system');
          for (const s of node.body) {
            if (this.shouldStop) break;
            lastRepeatRes = await this.visit(s);
          }
        }
        return lastRepeatRes;

      case 'PipelineStatement':
        const leftVal = await this.visit(node.left);
        this.pipelineInput = leftVal;
        const rightVal = await this.visit(node.right);
        this.pipelineInput = null;
        return rightVal;

      case 'CommandStatement':
        return await this.executeCommand(node.name, node.args);

      case 'BinaryExpression':
        const left = await this.visit(node.left);
        const right = await this.visit(node.right);
        return this.evaluateBinary(node.operator, left, right);

      case 'Literal':
        return node.value;

      case 'Variable':
        const v = this.getVariable(node.name);
        if (v === undefined) {
          throw new ReferenceError(`Undefined variable $${node.name}`);
        }
        return v;

      case 'Identifier':
        return node.name;

      default:
        throw new Error(`Unknown AST node type '${node.type}'`);
    }
  }

  async executeCommand(name, argNodes) {
    const evaluatedArgs = [];
    for (const argNode of argNodes) {
      evaluatedArgs.push(await this.visit(argNode));
    }

    if (typeof this.stdlib[name] === 'function') {
      return await this.stdlib[name](...evaluatedArgs);
    }

    this.log(`[Command] Executed generic '${name}'`, 'info');
    return { command: name, args: evaluatedArgs };
  }

  evaluateBinary(op, left, right) {
    switch (op) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '==': return left == right;
      case '!=': return left != right;
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      default:
        throw new Error(`Unsupported operator '${op}'`);
    }
  }
}
