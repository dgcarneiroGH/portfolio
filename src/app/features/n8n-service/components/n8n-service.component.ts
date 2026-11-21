import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { N8nStep, N8nWorkflowService, parseHours, stepAnswered } from './n8n-workflow.service';

/**
 * Workflow interactivo de n8n (ruta /n8n): tres tarjetas de pregunta conectadas
 * como nodos por cables (pin → línea → pin) y una tarjeta de output de
 * ejecución. El carril desliza con una transición lenta y, durante el salto,
 * los cables entre tarjetas se animan (flujo de datos); los CTAs y pins de
 * salida permanecen deshabilitados hasta rellenar el campo del nodo. La
 * lógica vive en N8nWorkflowService y el CTA final entrega un lead
 * preconstruido al formulario de contacto.
 */
@Component({
  selector: 'app-n8n-service',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './n8n-service.component.html',
  // Dos hojas por región + presupuesto: el budget anyComponentStyle (8 kB)
  // aplica por fichero (angular.json).
  styleUrls: [
    './n8n-service.component.scss',
    './n8n-service-canvas.scss',
    './n8n-service-results.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class N8nServiceComponent implements AfterViewChecked {
  /** Ventana de transición: slide 1.4s + cola de la animación del cable. */
  private static readonly TRANSITION_MS = 1500;

  protected readonly workflow = inject(N8nWorkflowService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * true mientras el carril desliza: los cables se animan y se bloquean
   * nuevos saltos hasta que termina (guard contra doble clic).
   */
  protected readonly flowing = signal(false);
  private readonly transitioning = signal(false);

  /**
   * Al cambiar de nodo, el foco se mueve al <h2> del nodo nuevo (patrón de
   * asistentes, WCAG 2.4.3): el lector de pantallas anuncia el título y el
   * teclado continúa desde ahí. El primer render no roba el foco.
   */
  private pendingFocus = false;
  private firstStepCheck = true;

  constructor() {
    effect(() => {
      this.workflow.step(); // Rastrea el cambio de nodo.
      if (this.firstStepCheck) {
        this.firstStepCheck = false;
        return;
      }
      this.pendingFocus = true;
    });
  }

  ngAfterViewChecked(): void {
    if (!this.pendingFocus) return;
    const heading = this.host.nativeElement.querySelector<HTMLElement>(
      `#n8n-slide-${this.workflow.step()} [data-n8n-heading]`
    );
    if (heading) {
      heading.focus();
      this.pendingFocus = false;
    }
  }

  /** ¿La respuesta del nodo `step` está rellenada? Deshabilita CTAs y pins. */
  protected canAdvance(step: N8nStep): boolean {
    return stepAnswered(step, this.workflow.answers());
  }

  /** Transform del carril para el nodo activo (translateX(-N%)). */
  protected trackTransform(): string {
    const index = this.workflow.step() - 1;
    return index === 0 ? 'translateX(0%)' : `translateX(-${index * 100}%)`;
  }

  /**
   * Cambia de nodo con la secuencia del lienzo: aplica la acción, anima los
   * cables durante el deslizamiento y libera el guard al terminar.
   */
  protected animateTo(action: () => void): void {
    if (this.transitioning()) return;
    this.transitioning.set(true);
    this.flowing.set(true);
    action();
    setTimeout(() => {
      this.flowing.set(false);
      this.transitioning.set(false);
    }, N8nServiceComponent.TRANSITION_MS);
  }

  protected next(): void {
    this.animateTo(() => this.workflow.next());
  }

  protected back(): void {
    this.animateTo(() => this.workflow.back());
  }

  protected onTaskInput(event: Event): void {
    this.workflow.setTask((event.target as HTMLTextAreaElement).value);
  }

  protected onObjectiveInput(event: Event): void {
    this.workflow.setObjective((event.target as HTMLTextAreaElement).value);
  }

  /**
   * Solo dígitos: se sanea el valor tecleado (letras/símbolos nunca persisten
   * en el campo) y se alimenta el modelo con el número acotado (parseHours).
   */
  protected onHoursInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '').slice(0, 3);
    if (sanitized !== input.value) {
      input.value = sanitized;
    }
    this.workflow.setHours(parseHours(sanitized));
  }

  /** CTA del output: deja el lead pendiente y navega a la sección de contacto. */
  protected goContact(): void {
    this.workflow.prepareLead();
    void this.router.navigate(['/contact']);
  }

  /** Escape en el output reinicia el workflow (atajo del prototipo). */
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.workflow.step() === 4) {
      this.workflow.reset();
    }
  }
}
