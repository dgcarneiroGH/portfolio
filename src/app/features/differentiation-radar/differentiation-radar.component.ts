import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DIFFERENTIATION_AXES } from './constants/differentiation-radar.constants';
import { DifferentiationAxisId } from './interfaces/differentiation-radar.interface';

/**
 * Radar de diferenciación: bloque narrativo entre la hero y la sección de
 * servicios. Sin correspondencia en el navbar (no es una sección de SECTIONS
 * ni tiene id de scroll-spy).
 *
 * Efectos:
 * - Creación punto a punto (one-shot al entrar en viewport): primero los
 *   vértices de la consultora y su polígono; después los míos. Con
 *   `prefers-reduced-motion` o sin IntersectionObserver, render estático.
 * - Mouse parallax por capas (solo puntero fino): cada capa del SVG se
 *   desplaza con una profundidad distinta, con interpolación en rAF.
 * - Hover/foco en un bullet ilumina los dos vértices y la etiqueta de su eje
 *   (azul de acento) y el propio bullet con el halo del sidebar.
 *
 * El gráfico es SVG generado desde los datos de los ejes (misma geometría del
 * mock: hexágono regular de 6 ejes, radio 160, anillos cada 32).
 */
interface RadarPoint {
  readonly id: DifferentiationAxisId;
  readonly x: number;
  readonly y: number;
}

interface RadarLabel {
  readonly id: DifferentiationAxisId;
  readonly titleKey: string;
  readonly x: number;
  readonly y: number;
  readonly anchor: 'start' | 'middle' | 'end';
}

// Geometría. El viewBox es 640x500 (no 500x500) para dejar margen lateral a
// las etiquetas de eje sin recortarlas.
const CENTER_X = 320;
const CENTER_Y = 250;
const MAX_RADIUS = 160;
const RING_RADII = [32, 64, 96, 128, 160] as const;
/** Distancia radial del vértice a su etiqueta. */
const LABEL_PADDING = 20;
/** Separación lateral entre el vértice y las etiquetas de los ejes lados. */
const LABEL_GAP = 6;
/** Perímetro del hexágono exterior (lado = radio = 160) redondeado por arriba. */
const POLYGON_DASH = 1000;

const axisAngle = (index: number): number => ((-90 + index * 60) * Math.PI) / 180;

const pointAt = (index: number, radius: number): { x: number; y: number } => ({
  x: CENTER_X + radius * Math.cos(axisAngle(index)),
  y: CENTER_Y + radius * Math.sin(axisAngle(index))
});

const hexagon = (radius: number): string =>
  DIFFERENTIATION_AXES.map((_, index) => {
    const point = pointAt(index, radius);
    return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
  }).join(' ');

const polygon = (values: number[]): string =>
  DIFFERENTIATION_AXES.map((_, index) => {
    const point = pointAt(index, (values[index] / 10) * MAX_RADIUS);
    return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
  }).join(' ');

const seriesPoints = (series: 'mine' | 'rival'): RadarPoint[] =>
  DIFFERENTIATION_AXES.map((axis, index) => ({
    id: axis.id,
    ...pointAt(index, (axis[series] / 10) * MAX_RADIUS)
  }));

const axisLabel = (index: number): RadarLabel => {
  const axis = DIFFERENTIATION_AXES[index];
  const vertex = pointAt(index, MAX_RADIUS);

  // Ejes superior e inferior: centrados sobre/debajo del vértice.
  if (index === 0 || index === 3) {
    return {
      id: axis.id,
      titleKey: axis.titleKey,
      x: CENTER_X,
      y: index === 0 ? vertex.y - LABEL_PADDING : vertex.y + LABEL_PADDING,
      anchor: 'middle'
    };
  }

  // Ejes laterales: anclados hacia fuera del vértice.
  const onRight = index < 3;
  return {
    id: axis.id,
    titleKey: axis.titleKey,
    x: vertex.x + (onRight ? LABEL_GAP : -LABEL_GAP),
    y: vertex.y,
    anchor: onRight ? 'start' : 'end'
  };
};

@Component({
  selector: 'app-differentiation-radar',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './differentiation-radar.component.html',
  styleUrl: './differentiation-radar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DifferentiationRadarComponent {
  /** Ejes del radar: fuente de verdad de bullets, vértices y etiquetas. */
  readonly axes = DIFFERENTIATION_AXES;
  readonly rings: readonly string[] = RING_RADII.map(hexagon);
  readonly spokes = DIFFERENTIATION_AXES.map((_, index) => pointAt(index, MAX_RADIUS));
  readonly center = { x: CENTER_X, y: CENTER_Y };
  readonly minePolygon = polygon(DIFFERENTIATION_AXES.map((axis) => axis.mine));
  readonly rivalPolygon = polygon(DIFFERENTIATION_AXES.map((axis) => axis.rival));
  readonly minePoints = seriesPoints('mine');
  readonly rivalPoints = seriesPoints('rival');
  readonly labels = DIFFERENTIATION_AXES.map((_, index) => axisLabel(index));
  /** Cota del trazo animado (stroke-dasharray de los polígonos). */
  readonly polygonDash = POLYGON_DASH;

  /** `true` si la creación punto a punto puede reproducirse. */
  readonly animated = signal(true);
  /** Reveal one-shot: el gráfico ya entró en viewport. */
  readonly revealed = signal(false);
  /** Eje resaltado desde los bullets (hover o foco de teclado). */
  readonly hoveredAxis = signal<DifferentiationAxisId | null>(null);

  private readonly _destroyRef = inject(DestroyRef);
  private readonly _chartCard =
    viewChild.required<ElementRef<HTMLElement>>('chartCard');
  private readonly _parallaxLayers =
    viewChildren<ElementRef<SVGGElement>>('parallaxLayer');

  private _revealObserver: IntersectionObserver | null = null;
  private _cardElement: HTMLElement | null = null;
  private _rafId = 0;
  private readonly _cursor = { x: 0, y: 0 };
  private readonly _target = { x: 0, y: 0 };

  constructor() {
    afterNextRender(() => this._setupEffects());
    this._destroyRef.onDestroy(() => this._teardownEffects());
  }

  /** Marca el eje asociado a un bullet (mouseenter / focus). */
  hoverAxis(id: DifferentiationAxisId): void {
    this.hoveredAxis.set(id);
  }

  /** Limpia el resaltado (mouseleave / blur). */
  clearHover(): void {
    this.hoveredAxis.set(null);
  }

  // #region Efectos (reveal one-shot + parallax)

  private _setupEffects(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._renderStatically();
      return;
    }

    this._cardElement = this._chartCard().nativeElement;

    if (typeof IntersectionObserver === 'function') {
      this._revealObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.revealed.set(true);
            this._revealObserver?.disconnect();
            this._revealObserver = null;
          }
        },
        { threshold: 0.35 }
      );
      this._revealObserver.observe(this._cardElement);
    } else {
      this._renderStatically();
    }

    this._setupParallax();
  }

  /** Render estático completo: sin secuencia de creación ni parallax. */
  private _renderStatically(): void {
    this.animated.set(false);
    this.revealed.set(true);
  }

  /** Parallax del gráfico: solo con puntero fino (ratón/trackpad). */
  private _setupParallax(): void {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    this._cardElement?.addEventListener('pointermove', this._onPointerMove);
    this._cardElement?.addEventListener('pointerleave', this._onPointerLeave);
  }

  private readonly _onPointerMove = (event: PointerEvent): void => {
    if (!this._cardElement) {
      return;
    }

    const rect = this._cardElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    this._target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this._target.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    this._startParallaxLoop();
  };

  private readonly _onPointerLeave = (): void => {
    this._target.x = 0;
    this._target.y = 0;
    this._startParallaxLoop();
  };

  /**
   * Bucle rAF con interpolación: el cursor persigue al objetivo con inercia y
   * cada capa se desplaza según su `data-depth`. Se detiene solo al asentarse
   * de vuelta en el reposo.
   */
  private _startParallaxLoop(): void {
    if (this._rafId) {
      return;
    }

    const step = (): void => {
      this._cursor.x += (this._target.x - this._cursor.x) * 0.12;
      this._cursor.y += (this._target.y - this._cursor.y) * 0.12;

      for (const layer of this._parallaxLayers()) {
        const depth = Number(layer.nativeElement.dataset['depth'] ?? 0);
        layer.nativeElement.style.transform = `translate3d(${(this._cursor.x * depth).toFixed(2)}px, ${(this._cursor.y * depth).toFixed(2)}px, 0)`;
      }

      const settled =
        this._target.x === 0 &&
        this._target.y === 0 &&
        Math.abs(this._cursor.x) < 0.01 &&
        Math.abs(this._cursor.y) < 0.01;

      if (settled) {
        this._cursor.x = 0;
        this._cursor.y = 0;
        for (const layer of this._parallaxLayers()) {
          layer.nativeElement.style.transform = '';
        }
        this._rafId = 0;
        return;
      }

      this._rafId = requestAnimationFrame(step);
    };

    this._rafId = requestAnimationFrame(step);
  }

  private _teardownEffects(): void {
    this._revealObserver?.disconnect();
    this._revealObserver = null;

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }

    if (this._cardElement) {
      this._cardElement.removeEventListener('pointermove', this._onPointerMove);
      this._cardElement.removeEventListener('pointerleave', this._onPointerLeave);
      this._cardElement = null;
    }
  }

  // #endregion
}
