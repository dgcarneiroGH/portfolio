import {
  DAM_SECOND_SUBJECTS,
  DAW_SECOND_SUBJECTS,
  FIRST_YEAR_SUBJECTS,
  subjectListFor
} from './tutoring.constants';

/**
 * Listas de asignaturas por ciclo y año (elección del usuario 2026-11-21):
 * 1º DAW/DAM comparten troncal; en 2º la FCT — Proyecto final va PRIMERA y
 * destacada (sin estrella: color/estilo de línea diferente). Los nombres son
 * planos y las etiquetas visibles se resuelven vía i18n
 * (TUTORING.TERMINAL.SUBJECTS.<id>, regla AGENTS 2026-11-18: ids en inglés).
 */
describe('Listas de asignaturas por ciclo y año', () => {
  it('1º: troncal común de 5, en el orden del usuario y sin destacada', () => {
    expect(FIRST_YEAR_SUBJECTS.map((s) => s.id)).toEqual([
      'PROGRAMMING',
      'DATABASES',
      'SYSTEMS',
      'MARKUP_LANGUAGES',
      'DEV_ENVIRONMENTS'
    ]);
    expect(FIRST_YEAR_SUBJECTS.some((s) => s.highlighted)).toBeFalse();
  });

  it('2º DAM: 6 opciones con FCT primera y única destacada', () => {
    expect(DAM_SECOND_SUBJECTS.map((s) => s.id)).toEqual([
      'FCT',
      'DATA_ACCESS',
      'INTERFACES',
      'MOBILE',
      'PROCESSES',
      'ERP_SGE'
    ]);
    expect(DAM_SECOND_SUBJECTS.filter((s) => s.highlighted)).toEqual([
      { id: 'FCT', highlighted: true }
    ]);
  });

  it('2º DAW: 4 opciones con FCT primera y única destacada', () => {
    expect(DAW_SECOND_SUBJECTS.map((s) => s.id)).toEqual([
      'FCT',
      'WEB_CLIENT',
      'WEB_SERVER',
      'DEPLOYMENT'
    ]);
    expect(DAW_SECOND_SUBJECTS.filter((s) => s.highlighted)).toEqual([
      { id: 'FCT', highlighted: true }
    ]);
  });

  it('subjectListFor resuelve la lista por ciclo y año normalizados', () => {
    expect(subjectListFor('DAW', '1º')).toBe(FIRST_YEAR_SUBJECTS);
    expect(subjectListFor('DAM', '1º')).toBe(FIRST_YEAR_SUBJECTS);
    expect(subjectListFor('DAM', '2º')).toBe(DAM_SECOND_SUBJECTS);
    expect(subjectListFor('DAW', '2º')).toBe(DAW_SECOND_SUBJECTS);
  });

  it('los ids son únicos dentro de cada lista', () => {
    for (const list of [FIRST_YEAR_SUBJECTS, DAM_SECOND_SUBJECTS, DAW_SECOND_SUBJECTS]) {
      expect(new Set(list.map((s) => s.id)).size).toBe(list.length);
    }
  });
});
