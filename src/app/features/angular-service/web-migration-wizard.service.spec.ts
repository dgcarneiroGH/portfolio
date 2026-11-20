import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import {
  WizardMessageTemplates,
  WizardResult,
  WebMigrationWizardService,
  buildPrebuiltMessage,
  computeResult
} from './web-migration-wizard.service';

// Traducciones mínimas para verificar el cableado real de ngx-translate
// en la generación del mensaje preconstruido.
const mockTranslations = {
  'WIZARD.DISCLAIMER': 'DISCLAIMER_TEXT',
  'WIZARD.MESSAGES.CREATE': 'CREATE_MSG',
  'WIZARD.MESSAGES.MAINTENANCE': 'MAINTENANCE_MSG',
  'WIZARD.MESSAGES.MIGRATE_AMOUNT': 'MIGRATE_MSG {{amount}}',
  'WIZARD.MESSAGES.MIGRATE_UNKNOWN': 'MIGRATE_UNKNOWN_MSG'
};

const mockLoader = {
  getTranslation: () => of(mockTranslations)
};

describe('computeResult (lógica pura de resultados)', () => {
  it('devuelve CREATE_NEW cuando el negocio no tiene web', () => {
    expect(computeResult({ hasWeb: false, usesWordPressLike: null })).toBe('CREATE_NEW');
  });

  it('devuelve MAINTENANCE para una web existente fuera de WordPress-like', () => {
    expect(computeResult({ hasWeb: true, usesWordPressLike: false })).toBe('MAINTENANCE');
  });

  it('devuelve MIGRATE para una web existente en WordPress-like', () => {
    expect(computeResult({ hasWeb: true, usesWordPressLike: true })).toBe('MIGRATE');
  });

  it('devuelve null mientras la primera respuesta esté pendiente', () => {
    expect(computeResult({ hasWeb: null, usesWordPressLike: null })).toBeNull();
  });

  it('devuelve null si hay web pero la plataforma aún no se ha respondido', () => {
    expect(computeResult({ hasWeb: true, usesWordPressLike: null })).toBeNull();
  });
});

describe('buildPrebuiltMessage (generación pura del mensaje)', () => {
  const templates: WizardMessageTemplates = {
    createNew: 'CREATE_MSG',
    maintenance: 'MAINTENANCE_MSG',
    // La plantilla con importe llega ya interpolada por el traductor.
    migrateWithAmount: 'MIGRATE_MSG 180',
    migrateWithoutAmount: 'MIGRATE_UNKNOWN_MSG',
    disclaimer: 'DISCLAIMER_TEXT'
  };

  it('usa la variante con importe (ya interpolada) para MIGRATE con coste conocido', () => {
    const message = buildPrebuiltMessage(
      'MIGRATE',
      { hostingKnown: true, hostingAmount: 180 },
      templates
    );
    expect(message).toBe('MIGRATE_MSG 180\n\nDISCLAIMER_TEXT');
  });

  it('usa la variante sin importe para MIGRATE cuando el coste es desconocido', () => {
    const message = buildPrebuiltMessage(
      'MIGRATE',
      { hostingKnown: false, hostingAmount: null },
      templates
    );
    expect(message).toBe('MIGRATE_UNKNOWN_MSG\n\nDISCLAIMER_TEXT');
  });

  it('usa la variante sin importe para MIGRATE si falta el importe', () => {
    const message = buildPrebuiltMessage(
      'MIGRATE',
      { hostingKnown: true, hostingAmount: null },
      templates
    );
    expect(message).toBe('MIGRATE_UNKNOWN_MSG\n\nDISCLAIMER_TEXT');
  });

  it('usa la plantilla de mantenimiento para MAINTENANCE', () => {
    const message = buildPrebuiltMessage(
      'MAINTENANCE',
      { hostingKnown: null, hostingAmount: null },
      templates
    );
    expect(message).toBe('MAINTENANCE_MSG\n\nDISCLAIMER_TEXT');
  });

  it('usa la plantilla de nuevo desarrollo para CREATE_NEW', () => {
    const message = buildPrebuiltMessage(
      'CREATE_NEW',
      { hostingKnown: null, hostingAmount: null },
      templates
    );
    expect(message).toBe('CREATE_MSG\n\nDISCLAIMER_TEXT');
  });

  it('añade siempre el descargo de no vinculación al mensaje', () => {
    for (const result of ['CREATE_NEW', 'MAINTENANCE', 'MIGRATE'] as WizardResult[]) {
      const message = buildPrebuiltMessage(
        result,
        { hostingKnown: null, hostingAmount: null },
        templates
      );
      expect(message.endsWith('\n\nDISCLAIMER_TEXT')).toBeTrue();
    }
  });
});

describe('WebMigrationWizardService (máquina de estados)', () => {
  function service(): WebMigrationWizardService {
    return TestBed.inject(WebMigrationWizardService);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('arranca en el paso 1 sin respuestas ni resultado', () => {
    const wizard = service();
    expect(wizard.step()).toBe(0);
    expect(wizard.result()).toBeNull();
    expect(wizard.answers()).toEqual({
      hasWeb: null,
      usesWordPressLike: null,
      hostingKnown: null,
      hostingAmount: null
    });
  });

  it('answerWeb(true) avanza al paso de WordPress', () => {
    const wizard = service();
    wizard.answerWeb(true);
    expect(wizard.step()).toBe(1);
    expect(wizard.result()).toBeNull();
    expect(wizard.answers().hasWeb).toBeTrue();
  });

  it('answerWeb(false) salta directamente al resultado CREATE_NEW', () => {
    const wizard = service();
    wizard.answerWeb(false);
    expect(wizard.step()).toBe('result');
    expect(wizard.result()).toBe('CREATE_NEW');
  });

  it('answerWordPress(false) salta directamente al resultado MAINTENANCE', () => {
    const wizard = service();
    wizard.answerWeb(true);
    wizard.answerWordPress(false);
    expect(wizard.step()).toBe('result');
    expect(wizard.result()).toBe('MAINTENANCE');
  });

  it('answerWordPress(true) avanza al paso de hosting', () => {
    const wizard = service();
    wizard.answerWeb(true);
    wizard.answerWordPress(true);
    expect(wizard.step()).toBe(2);
    expect(wizard.result()).toBeNull();
  });

  it('finishHosting registra el importe y muestra el resultado MIGRATE', () => {
    const wizard = service();
    wizard.answerWeb(true);
    wizard.answerWordPress(true);
    wizard.setHostingAmount(240);
    wizard.finishHosting();
    expect(wizard.step()).toBe('result');
    expect(wizard.result()).toBe('MIGRATE');
    expect(wizard.answers().hostingAmount).toBe(240);
    expect(wizard.answers().hostingKnown).toBeTrue();
  });

  it('markHostingUnknown limpia el importe y conduce a MIGRATE sin importe', () => {
    const wizard = service();
    wizard.answerWeb(true);
    wizard.answerWordPress(true);
    wizard.setHostingAmount(240);
    wizard.markHostingUnknown(true);
    expect(wizard.answers().hostingKnown).toBeFalse();
    expect(wizard.answers().hostingAmount).toBeNull();
    wizard.finishHosting();
    expect(wizard.result()).toBe('MIGRATE');
    expect(wizard.answers().hostingAmount).toBeNull();
  });

  it('setHostingAmount conserva el importe tecleado aunque sea menor que el umbral', () => {
    const wizard = service();
    wizard.setHostingAmount(11);
    expect(wizard.answers().hostingKnown).toBeTrue();
    expect(wizard.answers().hostingAmount).toBe(11);
  });

  it('setHostingAmount acepta justo MIN_HOSTING_AMOUNT como importe conocido', () => {
    const wizard = service();
    wizard.setHostingAmount(12);
    expect(wizard.answers().hostingKnown).toBeTrue();
    expect(wizard.answers().hostingAmount).toBe(12);
  });

  it('finishHosting marca como desconocido un importe bajo el umbral', () => {
    const wizard = service();
    wizard.setHostingAmount(10);
    wizard.finishHosting();
    expect(wizard.result()).toBe('MIGRATE');
    expect(wizard.answers().hostingKnown).toBeFalse();
    expect(wizard.answers().hostingAmount).toBeNull();
  });

  it('un importe por debajo del umbral conduce a MIGRATE con la variante sin importe', () => {
    const wizard = service();
    wizard.answerWeb(true);
    wizard.answerWordPress(true);
    wizard.setHostingAmount(10);
    wizard.finishHosting();
    expect(wizard.result()).toBe('MIGRATE');
    const lead = wizard.prepareLead();
    expect(lead!.message).toBe('MIGRATE_UNKNOWN_MSG\n\nDISCLAIMER_TEXT');
  });

  it('back() vuelve a la pregunta anterior desde los pasos 2 y 3', () => {
    const wizard = service();
    wizard.answerWeb(true);
    wizard.answerWordPress(true);
    wizard.back();
    expect(wizard.step()).toBe(1);
    expect(wizard.result()).toBeNull();
    wizard.back();
    expect(wizard.step()).toBe(0);
  });

  it('back() es un no-op en el primer paso y en el resultado', () => {
    const wizard = service();
    wizard.back();
    expect(wizard.step()).toBe(0);
    wizard.answerWeb(false);
    wizard.back();
    expect(wizard.step()).toBe('result');
    expect(wizard.result()).toBe('CREATE_NEW');
  });

  it('reset() restaura el estado inicial completo', () => {
    const wizard = service();
    wizard.answerWeb(true);
    wizard.answerWordPress(true);
    wizard.setHostingAmount(300);
    wizard.finishHosting();
    wizard.reset();
    expect(wizard.step()).toBe(0);
    expect(wizard.result()).toBeNull();
    expect(wizard.answers()).toEqual({
      hasWeb: null,
      usesWordPressLike: null,
      hostingKnown: null,
      hostingAmount: null
    });
  });

  it('prepareLead genera el lead pendiente con el mensaje preconstruido y el resultado', async () => {
    const wizard = service();
    wizard.answerWeb(true);
    wizard.answerWordPress(true);
    wizard.setHostingAmount(180);
    wizard.finishHosting();

    const lead = wizard.prepareLead();
    expect(lead).not.toBeNull();
    expect(lead!.result).toBe('MIGRATE');
    expect(lead!.message).toBe('MIGRATE_MSG 180\n\nDISCLAIMER_TEXT');
    expect(wizard.pendingLead()).toEqual(lead);
  });

  it('prepareLead usa la variante sin importe cuando el coste es desconocido', async () => {
    const wizard = service();
    wizard.answerWeb(true);
    wizard.answerWordPress(true);
    wizard.markHostingUnknown(true);
    wizard.finishHosting();

    const lead = wizard.prepareLead();
    expect(lead!.message).toBe('MIGRATE_UNKNOWN_MSG\n\nDISCLAIMER_TEXT');
  });

  it('prepareLead devuelve null si no hay resultado todavía', () => {
    const wizard = service();
    expect(wizard.prepareLead()).toBeNull();
    expect(wizard.pendingLead()).toBeNull();
  });

  it('consumePendingLead entrega el lead una sola vez y lo limpia', () => {
    const wizard = service();
    wizard.answerWeb(false);
    const lead = wizard.prepareLead();
    expect(lead).not.toBeNull();

    const consumed = wizard.consumePendingLead();
    expect(consumed).toEqual(lead);
    expect(wizard.pendingLead()).toBeNull();
    expect(wizard.consumePendingLead()).toBeNull();
  });

  it('reset() también limpia el lead pendiente', () => {
    const wizard = service();
    wizard.answerWeb(false);
    wizard.prepareLead();
    wizard.reset();
    expect(wizard.pendingLead()).toBeNull();
  });
});
