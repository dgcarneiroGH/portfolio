import { CodeLine, HERO_CODE_LINES, HERO_LOG_MESSAGES, Token, TokenKind } from './code-lines';

describe('HERO_CODE_LINES', () => {
  const KINDS: TokenKind[] = [
    'keyword',
    'ident',
    'string',
    'number',
    'punct',
    'comment',
    'prop',
    'boolean'
  ];

  it('declares at least the Profile and engine blocks of the current snippet', () => {
    const text = HERO_CODE_LINES.map((l) =>
      `${' '.repeat(l.indent * 2)}${l.tokens.map((t) => t.text).join('')}`
    ).join('\n');

    expect(text).toContain('const Profile');
    expect(text).toContain('infrastructure:');
    expect(text).toContain('tutoring:');
    expect(text).toContain('status:');
    expect(text).toContain('const engine');
    expect(text).toContain('active_projects');
    expect(text).toContain('n8n_workflows');
    expect(text).toContain('daw_success_rate');
  });

  it('keeps unique line ids so gutter rows can track them', () => {
    const ids = HERO_CODE_LINES.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only uses known token kinds and non-empty token text', () => {
    for (const line of HERO_CODE_LINES) {
      expect(line.indent).toBeGreaterThanOrEqual(0);

      for (const token of line.tokens) {
        expect(KINDS).toContain(token.kind);
        expect(typeof token.text).toBe('string');
      }

      // Las líneas "en blanco" se declaran sin tokens, nunca con un token vacío.
      if (line.tokens.length === 1) {
        expect(line.tokens[0].text.length).toBeGreaterThan(0);
      }
    }
  });

  it('attaches business hints only to the documented lines', () => {
    const hinted = HERO_CODE_LINES.filter((l) => l.hintKey !== undefined);
    const allowed = new Set(['stack', 'automation', 'hnc', 'status']);

    expect(hinted.length).toBe(4);
    for (const line of hinted) {
      expect(allowed.has(line.id)).toBeTrue();
    }
  });

  it('types the data as CodeLine[] of Token entries', () => {
    const first: CodeLine = HERO_CODE_LINES[0];
    const token: Token = first.tokens[0];
    expect(token.kind).toBeDefined();
  });
});

describe('HERO_LOG_MESSAGES', () => {
  it('provides the rotating automation log queue', () => {
    expect(HERO_LOG_MESSAGES.length).toBeGreaterThanOrEqual(4);
    expect(HERO_LOG_MESSAGES.every((m) => typeof m === 'string' && m.length > 0)).toBeTrue();
    expect(HERO_LOG_MESSAGES.some((m) => m.startsWith('[PORTAL_CONVOCATORIAS]'))).toBeTrue();
    expect(HERO_LOG_MESSAGES.some((m) => m.startsWith('[BACKUP]'))).toBeTrue();
    expect(HERO_LOG_MESSAGES.some((m) => m.startsWith('[MENTORSHIP]'))).toBeTrue();
    expect(HERO_LOG_MESSAGES.some((m) => m.startsWith('[DEPLOY]'))).toBeTrue();
  });
});
