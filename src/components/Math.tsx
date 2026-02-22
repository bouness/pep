'use client';

import { evaluateMathExpression, formatNumber } from '@/lib/mathEvaluator';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

// Unique placeholder markers for LaTeX
const LATEX_BLOCK_PREFIX = '%%LATEX_BLOCK_';
const LATEX_INLINE_PREFIX = '%%LATEX_INLINE_';

/**
 * Process text containing LaTeX and math expressions
 * Order: 1) Extract/protect LaTeX, 2) Evaluate math expressions, 3) Restore LaTeX
 */
function processText(text: string): string {
  let result = text;
  const latexPlaceholders: Record<string, string> = {};
  let blockIndex = 0;
  let inlineIndex = 0;

  // Step 1: Extract and protect display LaTeX ($$...$$) - handle multiline
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
    const placeholder = `${LATEX_BLOCK_PREFIX}${blockIndex++}%%`;
    try {
      latexPlaceholders[placeholder] = katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      latexPlaceholders[placeholder] = match;
    }
    return placeholder;
  });

  // Step 2: Extract and protect inline LaTeX ($...$) 
  // This regex handles LaTeX with nested braces like $K_{zt}$ and $x^{2}$
  // It's more careful to not match empty $ or stray $ signs
  result = result.replace(/\$([^$\s][^$]*?[^$\s]?)\$|\$([^$\s])\$/g, (match, latex1, latex2) => {
    const latex = latex1 || latex2; // Handle both cases
    const placeholder = `${LATEX_INLINE_PREFIX}${inlineIndex++}%%`;
    try {
      latexPlaceholders[placeholder] = katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      latexPlaceholders[placeholder] = match;
    }
    return placeholder;
  });

  // Step 3: Evaluate math expressions in curly braces
  // This regex now only matches {expression} that are NOT placeholders
  result = result.replace(/\{([^{}]+)\}/g, (match, expression) => {
    // Don't process if this is actually a LaTeX placeholder
    if (match.includes(LATEX_BLOCK_PREFIX) || match.includes(LATEX_INLINE_PREFIX)) {
      return match;
    }
    
    try {
      const value = evaluateMathExpression(expression.trim());
      return `<span class="math-result bg-blue-100 px-1 rounded text-blue-800 font-mono text-sm" title="${expression.trim()} = ${value}">${formatNumber(value)}</span>`;
    } catch {
      return match; // Return original if evaluation fails
    }
  });

  // Step 4: Restore LaTeX placeholders
  for (const [placeholder, rendered] of Object.entries(latexPlaceholders)) {
    // Use a global replace with a function to ensure all instances are replaced
    result = result.split(placeholder).join(rendered);
  }

  return result;
}

/**
 * Alternative approach: Process the text in a single pass with a state machine
 * This is more robust for complex mixed content
 */
function processTextRobust(text: string): string {
  const segments: { type: 'text' | 'latex-block' | 'latex-inline' | 'math'; content: string }[] = [];
  let i = 0;
  const len = text.length;
  
  while (i < len) {
    // Check for display LaTeX ($$...$$)
    if (text[i] === '$' && i + 1 < len && text[i + 1] === '$') {
      let j = i + 2;
      let found = false;
      while (j < len - 1) {
        if (text[j] === '$' && text[j + 1] === '$') {
          const latex = text.substring(i + 2, j);
          segments.push({ type: 'latex-block', content: latex });
          i = j + 2;
          found = true;
          break;
        }
        j++;
      }
      if (!found) {
        // No closing $$, treat as regular text
        segments.push({ type: 'text', content: text[i] });
        i++;
      }
      continue;
    }
    
    // Check for inline LaTeX ($...$)
    if (text[i] === '$') {
      let j = i + 1;
      let found = false;
      while (j < len) {
        if (text[j] === '$') {
          // Make sure it's not part of $$
          if (j + 1 < len && text[j + 1] === '$') {
            j += 2;
            continue;
          }
          const latex = text.substring(i + 1, j);
          segments.push({ type: 'latex-inline', content: latex });
          i = j + 1;
          found = true;
          break;
        }
        j++;
      }
      if (!found) {
        // No closing $, treat as regular text
        segments.push({ type: 'text', content: text[i] });
        i++;
      }
      continue;
    }
    
    // Check for math expression {...}
    if (text[i] === '{') {
      let j = i + 1;
      let depth = 1;
      let found = false;
      while (j < len) {
        if (text[j] === '{') depth++;
        if (text[j] === '}') {
          depth--;
          if (depth === 0) {
            const expr = text.substring(i + 1, j);
            segments.push({ type: 'math', content: expr });
            i = j + 1;
            found = true;
            break;
          }
        }
        j++;
      }
      if (!found) {
        // No closing }, treat as regular text
        segments.push({ type: 'text', content: text[i] });
        i++;
      }
      continue;
    }
    
    // Regular text
    segments.push({ type: 'text', content: text[i] });
    i++;
  }
  
  // Process segments
  let html = '';
  for (const segment of segments) {
    if (segment.type === 'text') {
      html += segment.content;
    } else if (segment.type === 'latex-block') {
      try {
        html += katex.renderToString(segment.content, {
          displayMode: true,
          throwOnError: false,
          output: 'html',
        });
      } catch {
        html += `$$${segment.content}$$`; // Fallback
      }
    } else if (segment.type === 'latex-inline') {
      try {
        html += katex.renderToString(segment.content, {
          displayMode: false,
          throwOnError: false,
          output: 'html',
        });
      } catch {
        html += `$${segment.content}$`; // Fallback
      }
    } else if (segment.type === 'math') {
      try {
        const value = evaluateMathExpression(segment.content);
        html += `<span class="math-result bg-blue-100 px-1 rounded text-blue-800 font-mono text-sm" title="${segment.content} = ${value}">${formatNumber(value)}</span>`;
      } catch {
        html += `{${segment.content}}`; // Fallback
      }
    }
  }
  
  return html;
}

/**
 * Render text with:
 * - LaTeX math: $...$ inline, $$...$$ block
 * - Math expressions: {...} evaluated and displayed
 * 
 * LaTeX is processed FIRST to protect subscripts/superscripts like $K_{zt}$
 */
export function MathText({ text, className = '' }: MathTextProps) {
  // Choose which processor to use
  // For most cases, processTextRobust is more reliable
  const processedHtml = processTextRobust(text);
  
  // Handle newlines
  const withLineBreaks = processedHtml.split('\n').join('<br/>');
  
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: withLineBreaks }}
    />
  );
}

export default MathText;