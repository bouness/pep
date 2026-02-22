/**
 * Safe Math Expression Evaluator
 * Uses JavaScript's native evaluation with sanitization for security
 */

// Allowed math constants
const MATH_CONSTANTS = [
  'PI', 'E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'SQRT2', 'SQRT1_2'
].join('|');

// Allowed math functions
const MATH_FUNCTIONS = [
  'sqrt', 'cbrt', 'abs', 'sign', 'floor', 'ceil', 'round', 'trunc',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
  'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
  'log', 'log10', 'log2', 'ln', 'exp', 'expm1',
  'pow', 'min', 'max', 'random'
].join('|');

/**
 * Sanitize and prepare expression for evaluation
 * Converts common notation to JavaScript Math format
 */
function prepareExpression(expr: string): string {
  let prepared = expr
    // Replace ^ with ** for exponentiation
    .replace(/\^/g, '**')
    // Replace common constants
    .replace(/\bPI\b/gi, 'Math.PI')
    .replace(/\bE\b/g, 'Math.E')
    // Replace math functions with Math. prefix
    .replace(new RegExp(`\\b(${MATH_FUNCTIONS})\\b`, 'g'), 'Math.$1')
    // Handle ln as natural log
    .replace(/Math\.ln/g, 'Math.log');
  
  return prepared;
}

/**
 * Check if expression is safe to evaluate
 */
function isSafeExpression(expr: string): boolean {
  // Remove all allowed patterns and check if anything remains
  const testExpr = expr
    .replace(/\d+\.?\d*/g, '')  // numbers
    .replace(/Math\.\w+/g, '')   // Math functions/constants
    .replace(/[()+\-*/^%,.\s]/g, '') // operators
    .replace(new RegExp(`\\b(${MATH_FUNCTIONS}|${MATH_CONSTANTS})\\b`, 'gi'), '');
  
  return testExpr.length === 0;
}

/**
 * Evaluate a mathematical expression string safely
 */
export function evaluateMathExpression(expression: string): number {
  const prepared = prepareExpression(expression);
  
  if (!isSafeExpression(prepared)) {
    throw new Error(`Invalid expression: ${expression}`);
  }
  
  try {
    // Use Function constructor for safer evaluation than eval
    const fn = new Function(`return (${prepared})`);
    const result = fn();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error(`Invalid result for: ${expression}`);
    }
    
    return result;
  } catch (error) {
    throw new Error(`Failed to evaluate: ${expression}`);
  }
}

/**
 * Format a number for display
 */
export function formatNumber(value: number, precision: number = 4): string {
  if (Math.abs(value) < 0.0001 && value !== 0) {
    return value.toExponential(precision);
  }
  if (Math.abs(value) >= 1e9) {
    return value.toExponential(precision);
  }
  
  const rounded = parseFloat(value.toPrecision(precision));
  return rounded.toString();
}

/**
 * Find all math expressions in curly braces that are NOT inside KaTeX delimiters
 */
function findMathExpressions(text: string): RegExpExecArray[] {
  const matches: RegExpExecArray[] = [];
  
  // First, find all KaTeX blocks to exclude them
  const katexBlocks: { start: number; end: number }[] = [];
  
  // Match inline KaTeX $...$ (but not $$...$$)
  const inlineKatexRegex = /\$(.+?)\$/g;
  let match;
  while ((match = inlineKatexRegex.exec(text)) !== null) {
    katexBlocks.push({
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  // Match display KaTeX $$...$$
  const displayKatexRegex = /\$\$(.+?)\$\$/g;
  while ((match = displayKatexRegex.exec(text)) !== null) {
    katexBlocks.push({
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  // Now find all {expression} patterns
  const mathRegex = /\{([^}]+)\}/g;
  while ((match = mathRegex.exec(text)) !== null) {
    // Check if this match is inside any KaTeX block
    const isInsideKatex = katexBlocks.some(block => 
      match.index >= block.start && match.index < block.end
    );
    
    if (!isInsideKatex) {
      matches.push(match);
    }
  }
  
  return matches;
}

/**
 * Evaluate all math expressions in a text string
 * Expressions are wrapped in curly braces: {expression}
 * Expressions inside KaTeX delimiters ($...$ or $$...$$) are ignored
 */
export interface TextSegment {
  type: 'text' | 'math' | 'error' | 'katex';
  content: string;
  evaluated?: number;
  formatted?: string;
}

export function parseTextWithMath(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  
  // First, find all KaTeX blocks
  const katexBlocks: { start: number; end: number; content: string }[] = [];
  
  // Match display KaTeX $$...$$ first (to handle nested $)
  const displayKatexRegex = /\$\$([\s\S]+?)\$\$/g;
  let match;
  while ((match = displayKatexRegex.exec(text)) !== null) {
    katexBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[0]
    });
  }
  
  // Match inline KaTeX $...$ (only if not part of display KaTeX)
  const inlineKatexRegex = /\$(.+?)\$/g;
  while ((match = inlineKatexRegex.exec(text)) !== null) {
    // Check if this inline match is inside a display KaTeX block
    const isInsideDisplay = katexBlocks.some(block => 
      match.index >= block.start && match.index < block.end
    );
    
    if (!isInsideDisplay) {
      katexBlocks.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[0]
      });
    }
  }
  
  // Sort blocks by start position
  katexBlocks.sort((a, b) => a.start - b.start);
  
  // Now process the text, treating KaTeX blocks as text segments
  let lastIndex = 0;
  
  // Helper function to process math expressions in a text segment
  function processMathInText(textSegment: string, startOffset: number): TextSegment[] {
    const localSegments: TextSegment[] = [];
    const mathRegex = /\{([^}]+)\}/g;
    let localMatch;
    let localLastIndex = 0;
    
    while ((localMatch = mathRegex.exec(textSegment)) !== null) {
      // Add text before the match
      if (localMatch.index > localLastIndex) {
        localSegments.push({
          type: 'text',
          content: textSegment.slice(localLastIndex, localMatch.index),
        });
      }
      
      // Try to evaluate the expression
      const expression = localMatch[1].trim();
      try {
        const value = evaluateMathExpression(expression);
        const formatted = formatNumber(value);
        localSegments.push({
          type: 'math',
          content: expression,
          evaluated: value,
          formatted,
        });
      } catch (error) {
        localSegments.push({
          type: 'error',
          content: expression,
        });
      }
      
      localLastIndex = localMatch.index + localMatch[0].length;
    }
    
    // Add remaining text
    if (localLastIndex < textSegment.length) {
      localSegments.push({
        type: 'text',
        content: textSegment.slice(localLastIndex),
      });
    }
    
    return localSegments;
  }
  
  // Process text and KaTeX blocks
  for (const block of katexBlocks) {
    // Process text before this KaTeX block
    if (block.start > lastIndex) {
      const textBefore = text.slice(lastIndex, block.start);
      segments.push(...processMathInText(textBefore, lastIndex));
    }
    
    // Add the KaTeX block as text (so it won't be processed for math)
    segments.push({
      type: 'text',
      content: block.content,
    });
    
    lastIndex = block.end;
  }
  
  // Process remaining text after the last KaTeX block
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    segments.push(...processMathInText(remainingText, lastIndex));
  }
  
  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
}

/**
 * Simple function to replace math expressions in text with their values
 * Expressions inside KaTeX delimiters ($...$ or $$...$$) are ignored
 */
export function evaluateTextExpressions(text: string): string {
  const segments = parseTextWithMath(text);
  
  return segments.map(segment => {
    if (segment.type === 'math' && segment.formatted) {
      return segment.formatted;
    }
    return segment.content;
  }).join('');
}