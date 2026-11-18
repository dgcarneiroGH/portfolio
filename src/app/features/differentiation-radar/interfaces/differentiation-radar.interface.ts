/**
 * Ejes del radar de diferenciación. Los datos viven en
 * `constants/differentiation-radar.constants.ts` 
 */
export type DifferentiationAxisId =
  | 'specialization'
  | 'speed'
  | 'results'
  | 'access'
  | 'price'
  | 'guidance';

export interface DifferentiationAxis {
  readonly id: DifferentiationAxisId;
  /** Etiqueta del eje en el gráfico (clave i18n, siempre en inglés). */
  readonly titleKey: string;
  /** Texto del bullet asociado (clave i18n, siempre en inglés). */
  readonly descKey: string;
  /** Valor "Yo" en escala 0-10 (valores de referencia, ver nota al pie). */
  readonly mine: number;
  /** Valor "Consultora grande" en escala 0-10. */
  readonly rival: number;
}
