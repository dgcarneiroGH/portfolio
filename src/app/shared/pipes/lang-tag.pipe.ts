import { Pipe, PipeTransform } from '@angular/core';

/**
 * Closed dictionary of technical jargon that must be tagged with lang="en"
 * when it appears in text written in another language (typically Spanish).
 * Add only terms that actually appear in mixed-language content.
 */
const JARGON = [
  'Angular', 'Sanity', 'CMS', 'API', 'N8N', 'Notion', 'OpenAI',
  'Django', 'TypeScript', 'JavaScript', 'GraphQL', 'REST',
  'RabbitMQ', 'fullstack', 'frontend', 'backend', 'devops',
  'CRM', 'SaaS', 'SDK'
];

/** Tags whose textual content must NOT be wrapped (code, anchors, scripts). */
const SKIP_TAGS = ['code', 'pre', 'a', 'script', 'style'];

/** Attribute that marks a tag as a language wrap (idempotency). */
const LANG_ATTR_RE = /\blang\s*=\s*"([^"]*)"/i;

/**
 * Builds a whole-word regex (\b…\b) that matches any term in `terms`
 * (escaped). Flags: `g` global, `i` case-insensitive — original casing
 * of the match is preserved via capture group.
 */
function buildJargonRegex(terms: string[]): RegExp {
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
}

const JARGON_RE = buildJargonRegex(JARGON);

type Token =
  | { kind: 'tag'; content: string; tagName: string; isClose: boolean; isSelfClosing: boolean }
  | { kind: 'text'; content: string };

/**
 * Tokenises HTML into [tag | text] segments.
 * Recognises open/close tags, self-closing tags, comments and doctype.
 */
function tokenizeHtml(html: string): Token[] {
  const tokens: Token[] = [];
  const tagRe = /<!--[\s\S]*?-->|<!DOCTYPE[^>]+>|<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(html)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ kind: 'text', content: html.slice(lastIndex, match.index) });
    }
    const fullMatch = match[0];
    if (fullMatch.startsWith('<!--') || fullMatch.startsWith('<!DOCTYPE')) {
      tokens.push({
        kind: 'tag',
        content: fullMatch,
        tagName: '',
        isClose: false,
        isSelfClosing: true
      });
    } else {
      const isClose = fullMatch.startsWith('</');
      const tagName = (match[1] ?? '').toLowerCase();
      const isSelfClosing = /\/\s*>$/.test(fullMatch);
      tokens.push({ kind: 'tag', content: fullMatch, tagName, isClose, isSelfClosing });
    }
    lastIndex = tagRe.lastIndex;
  }
  if (lastIndex < html.length) {
    tokens.push({ kind: 'text', content: html.slice(lastIndex) });
  }
  return tokens;
}

/**
 * Returns the tag name if an open tag `tagName` opens a SKIP zone, else null.
 */
function shouldSkipOpenTag(tagName: string): string | null {
  return SKIP_TAGS.includes(tagName) ? tagName : null;
}

/**
 * Extracts the value of a `lang="…"` attribute from a tag's attribute string.
 */
function extractLangAttr(attrs: string): string | null {
  const m = attrs.match(LANG_ATTR_RE);
  return m ? m[1] : null;
}

@Pipe({ name: 'langTag', standalone: true, pure: true })
export class LangTagPipe implements PipeTransform {
  transform(html: string | null | undefined): string {
    if (!html) return '';
    const tokens = tokenizeHtml(html);
    const skipStack: string[] = [];
    const langWrapStack: string[] = [];
    let out = '';
    for (const tok of tokens) {
      if (tok.kind === 'tag') {
        out += tok.content;
        if (tok.tagName && !tok.isClose && !tok.isSelfClosing) {
          const skip = shouldSkipOpenTag(tok.tagName);
          if (skip) skipStack.push(skip);
          const langVal = extractLangAttr(tok.content);
          if (langVal) langWrapStack.push(langVal);
        } else if (tok.tagName && tok.isClose) {
          for (let i = skipStack.length - 1; i >= 0; i--) {
            if (skipStack[i] === tok.tagName) {
              skipStack.splice(i, 1);
              break;
            }
          }
          if (langWrapStack.length > 0) {
            langWrapStack.pop();
          }
        }
      } else {
        if (skipStack.length === 0 && langWrapStack.length === 0) {
          out += tok.content.replace(JARGON_RE, '<span lang="en">$1</span>');
        } else {
          out += tok.content;
        }
      }
    }
    return out;
  }
}
