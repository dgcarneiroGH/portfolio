/**
 * Fuente de verdad del contenido de la ventana de código del hero
 * (`developer.config.ts`) y de la cola de logs de automatización.
 *
 * Todo el contenido vive aquí y NO en el template: el componente lo renderiza
 * con `<span [class]="'tok-' + t.kind">` (resaltado resuelto en render, sin
 * parser en runtime y sin innerHTML dinámico).
 */

/** Tipos de token soportados por el resaltado propio del panel. */
export type TokenKind =
  | 'keyword'
  | 'ident'
  | 'string'
  | 'number'
  | 'punct'
  | 'comment'
  | 'prop'
  | 'boolean';

/** Un fragmento de código con su tipo de resaltado. */
export interface Token {
  text: string;
  kind: TokenKind;
}

/** Una línea de código: sangría (en niveles de 2 espacios) + tokens. */
export interface CodeLine {
  id: string;
  indent: number;
  tokens: Token[];
  /** Clave i18n (sufijo de HOME.*) del tooltip de negocio, si la lleva. */
  hintKey?: string;
}

/**
 * Snippet del perfil: mismo contenido que el panel estático anterior, con el
 * typo `infraestructure` corregido y el resaltado re-mapeado al union de
 * tokens de este componente.
 */
export const HERO_CODE_LINES: CodeLine[] = [
  {
    id: 'comment-profile',
    indent: 0,
    tokens: [
      { text: '// Nomacoda Core Developer & Mentorship Profile', kind: 'comment' }
    ]
  },
  {
    id: 'profile-open',
    indent: 0,
    tokens: [
      { text: 'const', kind: 'keyword' },
      { text: ' ', kind: 'punct' },
      { text: 'Profile', kind: 'ident' },
      { text: ' {', kind: 'punct' }
    ]
  },
  {
    id: 'role',
    indent: 1,
    tokens: [
      { text: 'role', kind: 'prop' },
      { text: ': ', kind: 'punct' },
      { text: "'Frontend Developer & Automation Architect'", kind: 'string' },
      { text: ';', kind: 'punct' }
    ]
  },
  {
    id: 'stack',
    indent: 1,
    hintKey: 'CODE_HINT_STACK',
    tokens: [
      { text: 'stack', kind: 'prop' },
      { text: ': [', kind: 'punct' },
      { text: "'Angular 21'", kind: 'string' },
      { text: ', ', kind: 'punct' },
      { text: "'Sanity.io'", kind: 'string' },
      { text: ', ', kind: 'punct' },
      { text: "'Supabase'", kind: 'string' },
      { text: ', ', kind: 'punct' },
      { text: "'Hugo'", kind: 'string' },
      { text: '];', kind: 'punct' }
    ]
  },
  {
    id: 'automation',
    indent: 1,
    hintKey: 'CODE_HINT_AUTOMATION',
    tokens: [
      { text: 'automation', kind: 'prop' },
      { text: ': ', kind: 'punct' },
      { text: "'N8N Workflows & Custom Webhooks'", kind: 'string' },
      { text: ';', kind: 'punct' }
    ]
  },
  {
    id: 'infrastructure',
    indent: 1,
    tokens: [
      { text: 'infrastructure', kind: 'prop' },
      { text: ': ', kind: 'punct' },
      { text: "'Docker & VPS Management'", kind: 'string' },
      { text: ';', kind: 'punct' }
    ]
  },
  {
    id: 'tutoring-open',
    indent: 1,
    tokens: [
      { text: 'tutoring', kind: 'prop' },
      { text: ': {', kind: 'punct' }
    ]
  },
  {
    id: 'hnc',
    indent: 2,
    hintKey: 'CODE_HINT_TUTORING',
    tokens: [
      { text: 'hnc', kind: 'prop' },
      { text: ': [', kind: 'punct' },
      { text: "'DAW'", kind: 'string' },
      { text: ', ', kind: 'punct' },
      { text: "'DAM'", kind: 'string' },
      { text: '],', kind: 'punct' }
    ]
  },
  {
    id: 'tools',
    indent: 2,
    tokens: [
      { text: 'tools', kind: 'prop' },
      { text: ': [', kind: 'punct' },
      { text: "'VS Code Live Share'", kind: 'string' },
      { text: ', ', kind: 'punct' },
      { text: "'Discord'", kind: 'string' },
      { text: '],', kind: 'punct' }
    ]
  },
  {
    id: 'focus',
    indent: 2,
    tokens: [
      { text: 'focus', kind: 'prop' },
      { text: ': ', kind: 'punct' },
      { text: "'FCT projects & mentorship'", kind: 'string' }
    ]
  },
  {
    id: 'tutoring-close',
    indent: 1,
    tokens: [{ text: '};', kind: 'punct' }]
  },
  {
    id: 'status',
    indent: 1,
    hintKey: 'CODE_HINT_STATUS',
    tokens: [
      { text: 'status', kind: 'prop' },
      { text: ': ', kind: 'punct' },
      { text: "'Available for projects & Mentoring'", kind: 'string' },
      { text: ';', kind: 'punct' }
    ]
  },
  {
    id: 'profile-close',
    indent: 0,
    tokens: [{ text: '}', kind: 'punct' }]
  },
  {
    id: 'blank',
    indent: 0,
    tokens: []
  },
  {
    id: 'comment-engine',
    indent: 0,
    tokens: [
      { text: '// Active automation & mentoring pipelines', kind: 'comment' }
    ]
  },
  {
    id: 'engine-open',
    indent: 0,
    tokens: [
      { text: 'const', kind: 'keyword' },
      { text: ' ', kind: 'punct' },
      { text: 'engine', kind: 'ident' },
      { text: ' = ', kind: 'punct' },
      { text: 'await', kind: 'keyword' },
      { text: ' ', kind: 'punct' },
      { text: 'deployZeroCluster', kind: 'ident' },
      { text: '({', kind: 'punct' }
    ]
  },
  {
    id: 'active-projects',
    indent: 1,
    tokens: [
      { text: 'active_projects', kind: 'prop' },
      { text: ': ', kind: 'punct' },
      { text: "'portalconvocatorias.es'", kind: 'string' },
      { text: ',', kind: 'punct' }
    ]
  },
  {
    id: 'n8n-workflows',
    indent: 1,
    tokens: [
      { text: 'n8n_workflows', kind: 'prop' },
      { text: ': ', kind: 'punct' },
      { text: "'Active'", kind: 'string' },
      { text: ',', kind: 'punct' }
    ]
  },
  {
    id: 'daw-success-rate',
    indent: 1,
    tokens: [
      { text: 'daw_success_rate', kind: 'prop' },
      { text: ': ', kind: 'punct' },
      { text: "'100%'", kind: 'string' }
    ]
  },
  {
    id: 'engine-close',
    indent: 0,
    tokens: [{ text: '});', kind: 'punct' }]
  }
];

/** Cola circular de logs de automatización del ecosistema real (n8n/VPS/tutorías). */
export const HERO_LOG_MESSAGES: string[] = [
  '[PORTAL_CONVOCATORIAS] Webhook triggered: syncing public grants… 24 new rows',
  '[BACKUP] GitHub auto-commit OK · 12 workflows · 03:00 UTC',
  '[MENTORSHIP] Nueva solicitud de tutoría DAW · respondida en 2h',
  '[DEPLOY] Docker stack healthy · 0 restarts · uptime 34d'
];
