import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Paso activo del workflow n8n: nodos 1-3 (preguntas) y 4 (output de ejecución). */
export type N8nStep = 1 | 2 | 3 | 4;

/** Respuestas del usuario a las tres tarjetas de pregunta del workflow. */
export interface N8nAnswers {
  task: string;
  hours: number | null;
  objective: string;
}

/** Lead listo para el formulario de contacto (mensaje oculto al usuario). */
export interface N8nLead {
  message: string;
}

/** Límites del input de horas del nodo "Compute Time Delta" (diseño Figma). */
export const MIN_HOURS = 1;
export const MAX_HOURS = 120;

/** Plantillas ya traducidas e interpoladas para componer el mensaje. */
/**
 * Plantillas ya traducidas para componer el mensaje preconstruido del lead.
 * La puerta de validación garantiza que las tres respuestas están rellenadas
 * al llegar al output, así que el lead lleva siempre las horas interpoladas.
 */
export interface N8nLeadTemplates {
  lead: string;
  disclaimer: string;
}

/**
 * Sanea el valor tecleado en el input de horas: solo dígitos (máximo 3),
 * null si no hay número válido y acotado a [MIN_HOURS, MAX_HOURS].
 */
export function parseHours(raw: string): number | null {
  const digits = raw.replace(/\D/g, '').slice(0, 3);
  if (digits === '') return null;
  const parsed = Number(digits);
  if (!Number.isFinite(parsed) || parsed < MIN_HOURS) return null;
  return Math.min(parsed, MAX_HOURS);
}

/**
 * Lógica pura: compone el mensaje preconstruido (oculto al usuario) a partir
 * del lead ya interpolado por el traductor y añade siempre el descargo de no
 * vinculación (mismo contrato que el wizard de migración).
 */
export function buildN8nLeadMessage(templates: N8nLeadTemplates): string {
  return `${templates.lead}\n\n${templates.disclaimer}`;
}

/**
 * Puerta de validación por nodo: ¿la respuesta de `step` está rellenada?
 * Los espacios solo cuentan como vacío y las horas válidas son las que
 * `parseHours` deja pasar (no null, no cero). El nodo 4 (output) no tiene
 * puerta. La consume la UI para deshabilitar CTAs y pins de salida.
 */
export function stepAnswered(step: N8nStep, answers: N8nAnswers): boolean {
  if (step === 1) return answers.task.trim() !== '';
  if (step === 2) return answers.hours !== null && answers.hours > 0;
  if (step === 3) return answers.objective.trim() !== '';
  return true;
}

/**
 * Estado y máquina de estados del workflow de n8n (/n8n): tres tarjetas de
 * pregunta conectadas como nodos y una tarjeta de output de ejecución.
 * También genera y entrega el mensaje preconstruido que el formulario de
 * contacto consume (una sola vez).
 */
@Injectable({ providedIn: 'root' })
export class N8nWorkflowService {
  private readonly translate = inject(TranslateService);

  private readonly _step = signal<N8nStep>(1);
  private readonly _answers = signal<N8nAnswers>({
    task: '',
    hours: null,
    objective: ''
  });
  private readonly _pendingLead = signal<N8nLead | null>(null);

  readonly step = this._step.asReadonly();
  readonly answers = this._answers.asReadonly();
  readonly pendingLead = this._pendingLead.asReadonly();

  /** Texto de la tarea repetitiva (nodo Webhook). */
  setTask(task: string): void {
    this._answers.update((answers) => ({ ...answers, task }));
  }

  /** Horas semanales (nodo Compute Time Delta); null si se limpia. */
  setHours(hours: number | null): void {
    this._answers.update((answers) => ({ ...answers, hours }));
  }

  /** Objetivo con el tiempo recuperado (nodo Target Impact). */
  setObjective(objective: string): void {
    this._answers.update((answers) => ({ ...answers, objective }));
  }

  /** Avanza al siguiente nodo; no pasa del output. */
  next(): void {
    const step = this._step();
    if (step < 4) {
      this._step.set((step + 1) as N8nStep);
    }
  }

  /** Retrocede al nodo anterior; no-op en el primero. */
  back(): void {
    const step = this._step();
    if (step > 1) {
      this._step.set((step - 1) as N8nStep);
    }
  }

  /** "Volver a configurar": estado inicial completo. */
  reset(): void {
    this._step.set(1);
    this._pendingLead.set(null);
    this._answers.set({ task: '', hours: null, objective: '' });
  }

  /**
   * Genera el mensaje preconstruido (en el idioma activo) con el descargo de
   * no vinculación y lo guarda como lead pendiente para el formulario de
   * contacto. A diferencia del wizard de migración no hay resultado nulo: las
   * tres preguntas son obligatorias de recorrido (el CTA vive en el output),
   * así que el mensaje se compone con las respuestas tal cual estén.
   */
  prepareLead(): N8nLead {
    const { task, hours, objective } = this._answers();
    const lead: N8nLead = {
      message: buildN8nLeadMessage({
        lead: this.translate.instant('N8N_WIZARD.MESSAGES.LEAD', {
          task,
          hours: hours ?? 0,
          objective
        }),
        disclaimer: this.translate.instant('N8N_WIZARD.DISCLAIMER')
      })
    };
    this._pendingLead.set(lead);
    return lead;
  }

  /** Consumo único del lead por el formulario de contacto. */
  consumePendingLead(): N8nLead | null {
    const lead = this._pendingLead();
    if (lead) {
      this._pendingLead.set(null);
    }
    return lead;
  }
}
