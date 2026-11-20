import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WebMigrationWizardService } from './web-migration-wizard.service';

/**
 * Wizard interactivo de migración web (ruta /angular): tres preguntas que
 * diagnostican si el visitante necesita un desarrollo nuevo, mantenimiento
 * o una migración a Angular + Sanity, y que enruta al formulario de contacto
 * con un mensaje preconstruido (oculto al usuario) generado a partir de las
 * respuestas. La lógica vive en WebMigrationWizardService.
 */
@Component({
  selector: 'app-angular-service',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './angular-service.component.html',
  // Dos hojas: el budget anyComponentStyle (8 kB) aplica por fichero.
  styleUrls: [
    './angular-service.component.scss',
    './angular-service-results.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AngularServiceComponent implements AfterViewChecked {
  protected readonly wizard = inject(WebMigrationWizardService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Al cambiar de paso o vista, el foco se mueve al <h2> del contenido nuevo
   * (patrón de asistentes, WCAG 2.4.3): el lector de pantallas anuncia el
   * título y el teclado continúa desde ahí. El primer render no roba el foco.
   */
  private pendingFocus = false;
  private firstStepCheck = true;

  constructor() {
    effect(() => {
      this.wizard.step(); // Rastrea el cambio de vista.
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
      '[data-wizard-heading]'
    );
    if (heading) {
      heading.focus();
      this.pendingFocus = false;
    }
  }

  protected isResult(): boolean {
    return this.wizard.step() === 'result';
  }

  /** Parámetro {{current}} del contador "Paso 0X / 03". */
  protected counterFor(step: 0 | 1 | 2): Record<string, string> {
    return { current: ['01', '02', '03'][step] };
  }

  /** ¿Importe anual conocido y mayor que cero? (variante con negrita). */
  protected hasHostingAmount(): boolean {
    const { hostingKnown, hostingAmount } = this.wizard.answers();
    return hostingKnown === true && hostingAmount !== null && hostingAmount > 0;
  }

  /**
   * Solo dígitos: se sanea el valor tecleado (letras/símbolos nunca
   * persisten en el campo) y se alimenta el modelo con el número limpio.
   */
  protected onHostingAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
    }
    const parsed = Number(sanitized);
    this.wizard.setHostingAmount(sanitized !== '' && Number.isFinite(parsed) && parsed > 0 ? parsed : null);
  }

  protected onHostingUnknownChange(event: Event): void {
    this.wizard.markHostingUnknown((event.target as HTMLInputElement).checked);
  }

  /** CTA del resultado: deja el lead pendiente y navega a la sección de contacto. */
  protected goContact(): void {
    if (this.wizard.prepareLead()) {
      void this.router.navigate(['/contact']);
    }
  }

  /** Escape en la pantalla de resultado reinicia el asistente (atajo del prototipo). */
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isResult()) {
      this.wizard.reset();
    }
  }
}
