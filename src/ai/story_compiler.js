/**
 * NovaLang Story-to-Code Natural Language Compiler
 * Converts plain English stories/descriptions into valid executable NovaLang (.nova) code.
 */

export class StoryCompiler {
  /**
   * Compiles natural language story text into NovaLang code
   * @param {string} storyText - Plain English description of automation flow
   * @returns {{ code: string, comments: string[], keywordsFound: string[] }}
   */
  static compile(storyText) {
    if (!storyText || typeof storyText !== 'string') {
      return { code: '# Empty story input\nlog "No story steps provided"', comments: [], keywordsFound: [] };
    }

    const sentences = storyText
      .split(/(?:\.|\n|then|and then|after that)/i)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const generatedLines = [];
    generatedLines.push('# Generated NovaLang (.nova) code from Natural Language Story');
    generatedLines.push('# Source Story: "' + storyText.replace(/\n/g, ' ') + '"\n');

    const keywordsFound = new Set();

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();

      // 1. Move motor / Servo movement pattern
      // e.g. "move motor 1 to 90 degrees at speed 50" or "turn motor base to 180"
      if (lower.includes('motor') || lower.includes('servo') || lower.includes('arm')) {
        keywordsFound.add('move_motor');
        const motorMatch = lower.match(/(motor\s*[a-zA-Z0-9_]+|servo\s*[a-zA-Z0-9_]+|arm\s*[a-zA-Z0-9_]+)/i);
        const motorId = motorMatch ? motorMatch[0].replace(/\s+/g, '_') : 'motor1';

        const angleMatch = lower.match(/(\d+)\s*(?:deg|degree|degrees|°)?/i);
        const angle = angleMatch ? parseInt(angleMatch[1]) : 90;

        const speedMatch = lower.match(/speed\s*(\d+)/i);
        const speed = speedMatch ? parseInt(speedMatch[1]) : 50;

        generatedLines.push(`move_motor "${motorId}" ${angle} ${speed}`);
        continue;
      }

      // 2. Gripper pattern ("grab payload", "close gripper", "open gripper", "release payload")
      if (lower.includes('gripper') || lower.includes('grab') || lower.includes('release') || lower.includes('clamp')) {
        keywordsFound.add('gripper_state');
        if (lower.includes('close') || lower.includes('grab') || lower.includes('clamp')) {
          generatedLines.push('gripper_state "close"');
        } else {
          generatedLines.push('gripper_state "open"');
        }
        continue;
      }

      // 3. Wait / Delay pattern ("wait 2 seconds", "pause 500ms")
      if (lower.includes('wait') || lower.includes('pause') || lower.includes('sleep') || lower.includes('delay')) {
        keywordsFound.add('wait');
        const waitMatch = lower.match(/(\d+)\s*(s|sec|seconds|ms|milliseconds)?/i);
        let waitVal = '1s';
        if (waitMatch) {
          const num = waitMatch[1];
          const unit = waitMatch[2] || 's';
          waitVal = unit.startsWith('m') ? `${num}ms` : `${num}s`;
        }
        generatedLines.push(`wait ${waitVal}`);
        continue;
      }

      // 4. Web Open / Navigate ("open url https://...", "navigate to ...")
      if (lower.includes('open') || lower.includes('navigate') || lower.includes('go to')) {
        keywordsFound.add('open');
        const urlMatch = sentence.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        const url = urlMatch ? (urlMatch[0].startsWith('http') ? urlMatch[0] : 'https://' + urlMatch[0]) : 'https://novasmart.io';
        generatedLines.push(`open "${url}"`);
        continue;
      }

      // 5. Click pattern ("click #submit", "click button")
      if (lower.includes('click') || lower.includes('press')) {
        keywordsFound.add('click');
        const selectorMatch = sentence.match(/["']([^"']+)["']|#[\w-]+|\.[\w-]+/);
        const selector = selectorMatch ? selectorMatch[0] : '#btn-action';
        generatedLines.push(`click "${selector}"`);
        continue;
      }

      // 6. Type input pattern ("type 'Enterprise' into #search")
      if (lower.includes('type') || lower.includes('enter text') || lower.includes('input')) {
        keywordsFound.add('type');
        const textMatch = sentence.match(/["']([^"']+)["']/);
        const text = textMatch ? textMatch[1] : 'NovaLang Input';
        generatedLines.push(`type "#input-box" "${text}"`);
        continue;
      }

      // 7. Extract data pattern
      if (lower.includes('extract') || lower.includes('scrape') || lower.includes('get data')) {
        keywordsFound.add('extract');
        generatedLines.push('set $data = extract "table.data-grid"');
        continue;
      }

      // 8. AI Prompt pattern ("summarize with AI", "ai analyze")
      if (lower.includes('ai') || lower.includes('summarize') || lower.includes('analyze')) {
        keywordsFound.add('ai');
        generatedLines.push(`ai "${sentence.replace(/"/g, "'")}"`);
        continue;
      }

      // 9. Repeat / Loop pattern ("repeat 3 times")
      if (lower.includes('repeat') || lower.includes('loop')) {
        keywordsFound.add('repeat');
        const countMatch = lower.match(/(\d+)\s*(?:times|iterations|loops)?/i);
        const count = countMatch ? parseInt(countMatch[1]) : 3;
        generatedLines.push(`repeat ${count} times\n  log "Looping story step..."\n  wait 500ms\nend`);
        continue;
      }

      // Fallback: Custom log message for descriptive sentence
      generatedLines.push(`log "${sentence.replace(/"/g, "'")}"`);
    }

    generatedLines.push('\nlog "Story automation flow executed successfully!"');

    return {
      code: generatedLines.join('\n'),
      sentencesCount: sentences.length,
      keywordsFound: Array.from(keywordsFound)
    };
  }
}
