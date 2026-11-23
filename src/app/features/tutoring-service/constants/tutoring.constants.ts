/**
 * Asignaturas por ciclo y año del terminal de tutorías (ruta /tutoring).
 * Elección del usuario (2026-11-21): 1º DAW/DAM comparten troncal; en 2º la
 * FCT — Proyecto final va PRIMERA y destacada (estilo de línea diferente, sin
 * estrella). Nombres planos; las etiquetas visibles NO viven aquí: se
 * resuelven vía i18n con `TUTORING.TERMINAL.SUBJECTS.<id>`
 * (regla AGENTS 2026-11-18: ids en inglés).
 */
export type TutoringSubjectId =
  | 'PROGRAMMING'
  | 'DATABASES'
  | 'SYSTEMS'
  | 'MARKUP_LANGUAGES'
  | 'DEV_ENVIRONMENTS'
  | 'FCT'
  | 'DATA_ACCESS'
  | 'INTERFACES'
  | 'MOBILE'
  | 'PROCESSES'
  | 'ERP_SGE'
  | 'WEB_CLIENT'
  | 'WEB_SERVER'
  | 'DEPLOYMENT';

export interface TutoringSubject {
  readonly id: TutoringSubjectId;
  /** true solo para FCT en 2º: línea con color/estilo diferente al resto. */
  readonly highlighted: boolean;
}

/** 1º DAW/DAM — troncal común, sin proyecto final. */
export const FIRST_YEAR_SUBJECTS: readonly TutoringSubject[] = [
  { id: 'PROGRAMMING', highlighted: false },
  { id: 'DATABASES', highlighted: false },
  { id: 'SYSTEMS', highlighted: false },
  { id: 'MARKUP_LANGUAGES', highlighted: false },
  { id: 'DEV_ENVIRONMENTS', highlighted: false }
];

/** 2º DAM — FCT — Proyecto final primera y destacada. */
export const DAM_SECOND_SUBJECTS: readonly TutoringSubject[] = [
  { id: 'FCT', highlighted: true },
  { id: 'DATA_ACCESS', highlighted: false },
  { id: 'INTERFACES', highlighted: false },
  { id: 'MOBILE', highlighted: false },
  { id: 'PROCESSES', highlighted: false },
  { id: 'ERP_SGE', highlighted: false }
];

/** 2º DAW — FCT — Proyecto final primera y destacada. */
export const DAW_SECOND_SUBJECTS: readonly TutoringSubject[] = [
  { id: 'FCT', highlighted: true },
  { id: 'WEB_CLIENT', highlighted: false },
  { id: 'WEB_SERVER', highlighted: false },
  { id: 'DEPLOYMENT', highlighted: false }
];

/**
 * Lista activa según las respuestas ya normalizadas del cuestionario:
 * 1º es común a DAW y DAM; en 2º cada ciclo tiene su plan.
 */
export function subjectListFor(
  cycle: string,
  year: string
): readonly TutoringSubject[] {
  if (year === '2º') {
    return cycle === 'DAM' ? DAM_SECOND_SUBJECTS : DAW_SECOND_SUBJECTS;
  }
  return FIRST_YEAR_SUBJECTS;
}
