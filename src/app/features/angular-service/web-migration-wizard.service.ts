import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Diagnóstico posible del asistente de migración. */
export type WizardResult = 'CREATE_NEW' | 'MAINTENANCE' | 'MIGRATE';

/** Vista activa del asistente: paso 1-3 (index 0-2) o pantalla de resultado. */
export type WizardView = 0 | 1 | 2 | 'result';

/** Respuestas del usuario a las tres preguntas del asistente. */
export interface WizardAnswers {
  hasWeb: boolean | null;
  usesWordPressLike: boolean | null;
  /** true = conoce el importe anual; false = "No lo sé exactamente". */
  hostingKnown: boolean | null;
  hostingAmount: number | null;
}

/** Lead listo para el formulario de contacto (mensaje oculto al usuario). */
export interface WizardLead {
  result: WizardResult;
  message: string;
}

/** Plantillas ya traducidas para componer el mensaje preconstruido. */
export interface WizardMessageTemplates {
  createNew: string;
  maintenance: string;
  /** Debe contener el token {{amount}}, ya interpolado por el traductor. */
  migrateWithAmount: string;
  migrateWithoutAmount: string;
}

/**
 * Umbral por debajo del cual el importe de hosting se trata como desconocido:
 * el copy ofrece migrar por el precio del dominio (~12 €/año), de modo que un
 * importe menor no sostiene el argumento "pagas de más por algo que puede
 * costarte casi nada".
 */
export const MIN_HOSTING_AMOUNT = 12;

/**
 * Lógica pura de resultados: !hasWeb → CreateNew;
 * hasWeb && !usesWordPressLike → Maintenance; hasWeb && usesWordPressLike → Migrate.
 * Devuelve null mientras el resultado aún no sea decidible.
 */
export function computeResult(
  answers: Pick<WizardAnswers, 'hasWeb' | 'usesWordPressLike'>
): WizardResult | null {
  if (answers.hasWeb === false) return 'CREATE_NEW';
  if (answers.hasWeb === true && answers.usesWordPressLike === false) return 'MAINTENANCE';
  if (answers.hasWeb === true && answers.usesWordPressLike === true) return 'MIGRATE';
  return null;
}

/**
 * Lógica pura: compone el mensaje preconstruido (oculto al usuario) a partir
 * del resultado, del importe de hosting y de las plantillas traducidas.
 * Añade siempre el descargo de no vinculación.
 */
export function buildPrebuiltMessage(
  result: WizardResult,
  hosting: Pick<WizardAnswers, 'hostingKnown' | 'hostingAmount'>,
  templates: WizardMessageTemplates
): string {
  let base: string;
  if (result === 'CREATE_NEW') {
    base = templates.createNew;
  } else if (result === 'MAINTENANCE') {
    base = templates.maintenance;
  } else if (hosting.hostingKnown === true && hosting.hostingAmount !== null) {
    // La plantilla llega con {{amount}} ya interpolado vía translate params.
    base = templates.migrateWithAmount;
  } else {
    base = templates.migrateWithoutAmount;
  }
  return base;
}

/**
 * Estado y máquina de estados del asistente de migración web (/angular).
 * También genera y entrega el mensaje preconstruido que el formulario de
 * contacto consume (una sola vez) para prellenar el campo oculto.
 */
@Injectable({ providedIn: 'root' })
export class WebMigrationWizardService {
  private readonly translate = inject(TranslateService);

  private readonly _step = signal<WizardView>(0);
  private readonly _answers = signal<WizardAnswers>({
    hasWeb: null,
    usesWordPressLike: null,
    hostingKnown: null,
    hostingAmount: null
  });
  private readonly _result = signal<WizardResult | null>(null);
  private readonly _pendingLead = signal<WizardLead | null>(null);

  readonly step = this._step.asReadonly();
  readonly answers = this._answers.asReadonly();
  readonly result = this._result.asReadonly();
  readonly pendingLead = this._pendingLead.asReadonly();

  /** Respuesta a la pregunta 1 (¿web?). "No" salta directo al resultado. */
  answerWeb(hasWeb: boolean): void {
    this._answers.update((answers) => ({ ...answers, hasWeb }));
    const result = computeResult(this._answers());
    if (result) {
      this.showResult(result);
    } else {
      this._step.set(1);
    }
  }

  /** Respuesta a la pregunta 2 (¿WordPress o similar?). "No" salta al resultado. */
  answerWordPress(usesWordPressLike: boolean): void {
    this._answers.update((answers) => ({ ...answers, usesWordPressLike }));
    if (usesWordPressLike) {
      this._step.set(2);
    } else {
      this.showResult('MAINTENANCE');
    }
  }

  /** Importe anual de hosting tecleado por el usuario (null si se limpia). */
  setHostingAmount(hostingAmount: number | null): void {
    this._answers.update((answers) => ({
      ...answers,
      hostingAmount,
      hostingKnown: amountIsKnown(hostingAmount)
    }));
  }

  /** Marca "No lo sé exactamente": anula el importe conocido. */
  markHostingUnknown(unknown: boolean): void {
    this._answers.update((answers) => ({
      ...answers,
      hostingKnown: !unknown,
      hostingAmount: unknown ? null : answers.hostingAmount
    }));
  }

  /**
   * CTA "Ver diagnóstico": cierra el asistente con el resultado MIGRATE.
   * Un importe por debajo de MIN_HOSTING_AMOUNT se trata como desconocido
   * (el umbral decide al confirmar, no mientras se teclea).
   */
  finishHosting(): void {
    this._answers.update((answers) => {
      const belowThreshold =
        answers.hostingKnown === true &&
        answers.hostingAmount !== null &&
        answers.hostingAmount < MIN_HOSTING_AMOUNT;
      return belowThreshold
        ? { ...answers, hostingKnown: false, hostingAmount: null }
        : answers;
    });
    this.showResult('MIGRATE');
  }

  /** Botón "Atrás": solo con sentido en los pasos 2 y 3. */
  back(): void {
    const step = this._step();
    if (step === 1) {
      this._result.set(null);
      this._step.set(0);
    } else if (step === 2) {
      this._result.set(null);
      this._step.set(1);
    }
  }

  /** "Repetir test": estado inicial completo. */
  reset(): void {
    this._step.set(0);
    this._result.set(null);
    this._pendingLead.set(null);
    this._answers.set({
      hasWeb: null,
      usesWordPressLike: null,
      hostingKnown: null,
      hostingAmount: null
    });
  }

  /**
   * Genera el mensaje preconstruido (en el idioma activo) con el descargo de
   * no vinculación y lo guarda como lead pendiente para el formulario de
   * contacto. Devuelve null si el asistente aún no tiene resultado.
   */
  prepareLead(): WizardLead | null {
    const result = this._result() ?? computeResult(this._answers());
    if (!result) return null;

    const { hostingKnown, hostingAmount } = this._answers();
    const templates: WizardMessageTemplates = {
      createNew: this.translate.instant('WIZARD.MESSAGES.CREATE'),
      maintenance: this.translate.instant('WIZARD.MESSAGES.MAINTENANCE'),
      migrateWithAmount: this.translate.instant('WIZARD.MESSAGES.MIGRATE_AMOUNT', {
        amount: hostingAmount ?? 0
      }),
      migrateWithoutAmount: this.translate.instant('WIZARD.MESSAGES.MIGRATE_UNKNOWN')
    };
    const lead: WizardLead = {
      result,
      message: buildPrebuiltMessage(result, { hostingKnown, hostingAmount }, templates)
    };
    this._pendingLead.set(lead);
    return lead;
  }

  /** Consumo único del lead por el formulario de contacto. */
  consumePendingLead(): WizardLead | null {
    const lead = this._pendingLead();
    if (lead) {
      this._pendingLead.set(null);
    }
    return lead;
  }

  private showResult(result: WizardResult): void {
    this._result.set(result);
    this._step.set('result');
  }
}

function amountIsKnown(hostingAmount: number | null): boolean {
  return hostingAmount !== null;
}
