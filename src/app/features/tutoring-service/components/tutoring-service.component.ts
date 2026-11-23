import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterEveryRender,
  afterNextRender,
  computed,
  effect,
  inject,
  viewChild
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TutoringTerminalService } from '../tutoring-terminal.service';

/** Prefijo de claves i18n del terminal (usado por activeQuestion). */
const TERMINAL_KEYS = 'TUTORING.TERMINAL';

/** Tolerancia (px) para considerar el scroll "clavado abajo" (~1.5 líneas). */
const BOTTOM_THRESHOLD_PX = 32;

/**
 * Página "Tutorías" del portfolio (ruta /tutoring): ventana IDE con estética
 * Discord cuyo interior es un terminal interactivo real (preguntas por líneas,
 * respuestas tecleadas en la línea de comandos; multi-selección de
 * asignaturas por números). La lógica vive en TutoringTerminalService y el
 * CTA final entrega un lead preconstruido al formulario de contacto.
 *
 * La raíz <section> hereda los estilos globales de styles.scss (flex + padding
 * que compensan el header fijo) y mantiene el fondo por defecto de la app
 * (regla AGENTS 2026-11-17): TODO el color Discord vive dentro de la ventana.
 * Los anillos de foco solo en interactivos (regla AGENTS 2026-11-18).
 */
@Component({
  selector: 'app-tutoring-service',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './tutoring-service.component.html',
  // Dos hojas por región: el chrome de la página (tutoring-service.component.scss)
  // y el interior del terminal (tutoring-terminal.scss). Budget
  // anyComponentStyle: 8 kB aplica por fichero (angular.json).
  styleUrls: [
    './tutoring-service.component.scss',
    './tutoring-terminal.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutoringServiceComponent implements AfterViewChecked {
  protected readonly terminal = inject(TutoringTerminalService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly terminalBody =
    viewChild.required<ElementRef<HTMLElement>>('terminalBody');
  private readonly cliInput =
    viewChild<ElementRef<HTMLInputElement>>('cliInput');

  /** Pregunta activa: texto del aria-label de la línea de comandos. */
  protected readonly activeQuestion = computed(() => {
    switch (this.terminal.step()) {
      case 'YEAR':
        return this.translate.instant(`${TERMINAL_KEYS}.QUESTIONS.YEAR`);
      case 'SUBJECTS':
        return this.translate.instant(`${TERMINAL_KEYS}.QUESTIONS.SUBJECTS`);
      case 'HOURS':
        return this.translate.instant(`${TERMINAL_KEYS}.QUESTIONS.HOURS`);
      case 'CONFIRM':
        return this.translate.instant(`${TERMINAL_KEYS}.QUESTIONS.CONFIRM`);
      case 'SENT':
        return this.translate.instant(`${TERMINAL_KEYS}.SUMMARY.SENT_LABEL`);
      default:
        return this.translate.instant(`${TERMINAL_KEYS}.QUESTIONS.CYCLE`);
    }
  });

  /**
   * Flags pendientes (patrón n8n). El scroll se consume en afterEveryRender
   * (vive aunque Angular 21 salte refreshView durante el tecleo puro); el
   * foco en ngAfterViewChecked (el paso cambia → la vista sí se refresca).
   */
  private pendingScroll = false;
  private pendingFocus = false;
  /**
   * Autoscroll pegajoso: true mientras el cursor esté (casi) al fondo. Subir
   * a leer lo desactiva (el tecleo deja de empujar); responder o volver al
   * fondo lo reactiva. Campo plano a propósito: el listener de scroll no
   * dispara detecciones (zoneless), solo alimenta esta decisión.
   */
  private pinned = true;
  /** CONFIRM→SENT: navega a /contact cuando el dispatch termine de escribirse. */
  private pendingNavigate = false;

  constructor() {
    // Cada línea revelada (log nuevo o avance del tecleo) marca el scroll
    // pendiente; lo consume afterEveryRender al final del ciclo de render.
    effect(() => {
      this.terminal.displayLines();
      this.pendingScroll = true;
    });
    // Sincronización del scroll pegajoso: afterEveryRender corre al final de
    // CADA ciclo de render, incluidos los que Angular 21 resuelve solo con el
    // repeater del @for (skip-rerender de la vista: ngAfterViewChecked no se
    // dispara durante el tecleo puro, que era el origen del scroll perdido).
    afterEveryRender(() => {
      if (!this.pendingScroll) return;
      this.pendingScroll = false;
      if (!this.pinned) return;
      const body = this.terminalBody().nativeElement;
      body.scrollTop = body.scrollHeight;
    });
    // El foco permanece siempre en la línea de comandos (el input ya no
    // desaparece nunca: la confirmación final es una pregunta más).
    effect(() => {
      this.terminal.step();
      this.pendingFocus = true;
    });
    // Registro del seguimiento de scroll (solo navegador; afterNextRender es
    // el patrón SSR-safe del repo: code-window, sections-page, radar). Si el
    // usuario se aleja del fondo, el autoscroll deja de empujar hasta que
    // vuelva abajo o responda.
    afterNextRender(() => {
      const body = this.terminalBody().nativeElement;
      body.addEventListener(
        'scroll',
        () => {
          const distance =
            body.scrollHeight - body.scrollTop - body.clientHeight;
          this.pinned = distance <= BOTTOM_THRESHOLD_PX;
        },
        { passive: true }
      );
    });
    // Navegación diferida: el servicio avisa en línea cuando el tecleo
    // termina (o se hace flush); si la sesión quedó en SENT, se navega.
    this.terminal.onTypingDone(() => this.handleTypingDone());
  }

  /** Fin de tecleo: salta a /contact si la sesión quedó enviada. */
  private handleTypingDone(): void {
    if (!this.pendingNavigate) return;
    this.pendingNavigate = false;
    if (this.terminal.step() === 'SENT') {
      this.router.navigate(['/contact']);
    }
  }

  ngAfterViewChecked(): void {
    // El scroll vive en afterEveryRender: ngAfterViewChecked solo corre si la
    // vista se refrescó, y durante el tecleo puro Angular 21 la salta.
    if (this.pendingFocus) {
      const input = this.cliInput()?.nativeElement;
      if (input && document.activeElement !== input) input.focus();
      this.pendingFocus = false;
    }
  }

  /**
   * Respuesta tecleada: envía, limpia y devuelve el foco al input. Si la
   * confirmación final pasa de CONFIRM a SENT, el salto a /contact se difiere
   * hasta que el [200 OK] termine de escribirse (efecto terminal).
   */
  protected submitAnswer(value: string): void {
    // Responder reactiva el seguimiento: el scroll se clava abajo aunque el
    // usuario estuviera leyendo el historial (cubre también `clear`).
    this.pinned = true;
    const before = this.terminal.step();
    this.terminal.submit(value);
    if (before === 'CONFIRM' && this.terminal.step() === 'SENT') {
      this.pendingNavigate = true;
      return;
    }
    const input = this.cliInput()?.nativeElement;
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}
