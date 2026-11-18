import { DifferentiationAxis } from '../interfaces/differentiation-radar.interface';

/**
 * Seis ejes del radar de diferenciación, en orden horario desde la cima
 * (misma disposición del mock). `mine`/`rival` son valores de referencia en
 * escala 0-10 (ver nota al pie del gráfico).
 */
export const DIFFERENTIATION_AXES: readonly DifferentiationAxis[] = [
  {
    id: 'specialization',
    titleKey: 'RADAR.AXES.SPECIALIZATION',
    descKey: 'RADAR.BULLETS.SPECIALIZATION_DESC',
    mine: 9,
    rival: 4
  },
  {
    id: 'speed',
    titleKey: 'RADAR.AXES.SPEED',
    descKey: 'RADAR.BULLETS.SPEED_DESC',
    mine: 8,
    rival: 2
  },
  {
    id: 'results',
    titleKey: 'RADAR.AXES.RESULTS',
    descKey: 'RADAR.BULLETS.RESULTS_DESC',
    mine: 9,
    rival: 7
  },
  {
    id: 'access',
    titleKey: 'RADAR.AXES.ACCESS',
    descKey: 'RADAR.BULLETS.ACCESS_DESC',
    mine: 9,
    rival: 2
  },
  {
    id: 'price',
    titleKey: 'RADAR.AXES.PRICE',
    descKey: 'RADAR.BULLETS.PRICE_DESC',
    mine: 5,
    rival: 7
  },
  {
    id: 'guidance',
    titleKey: 'RADAR.AXES.GUIDANCE',
    descKey: 'RADAR.BULLETS.GUIDANCE_DESC',
    mine: 9,
    rival: 2
  }
];
