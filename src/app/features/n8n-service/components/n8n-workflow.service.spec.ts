import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import {
  MAX_HOURS,
  N8nLeadTemplates,
  N8nWorkflowService,
  buildN8nLeadMessage,
  parseHours,
  stepAnswered
} from './n8n-workflow.service';

// Traducciones mínimas para verificar el cableado real de ngx-translate
// en la generación del mensaje preconstruido.
const mockTranslations = {
  'N8N_WIZARD.MESSAGES.LEAD': 'LEAD task:{{task}} hours:{{hours}} obj:{{objective}}',
  'N8N_WIZARD.DISCLAIMER': 'DISCLAIMER_TEXT'
};

const mockLoader = {
  getTranslation: () => of(mockTranslations)
};

describe('parseHours (saneado del input de horas)', () => {
  it('filtra todo lo que no sean dígitos', () => {
    expect(parseHours('6a7')).toBe(67);
  });

  it('devuelve null con texto sin dígitos o vacío', () => {
    expect(parseHours('abc')).toBeNull();
    expect(parseHours('')).toBeNull();
  });

  it('devuelve null con cero (por debajo del mínimo) y acota por arriba', () => {
    expect(parseHours('0')).toBeNull();
    expect(parseHours('250')).toBe(MAX_HOURS);
  });

  it('acepta valores dentro del rango, respeta el límite y limita a 3 dígitos', () => {
    expect(parseHours('7')).toBe(7);
    expect(parseHours('120')).toBe(120);
    expect(parseHours('1234')).toBe(MAX_HOURS);
  });
});

describe('buildN8nLeadMessage (generación pura del mensaje)', () => {
  it('compone el lead interpolado y añade el descargo', () => {
    const templates: N8nLeadTemplates = {
      lead: 'LEAD task:Sync hours:6 obj:Descansar',
      disclaimer: 'DISCLAIMER_TEXT'
    };
    const message = buildN8nLeadMessage(templates);
    expect(message).toBe('LEAD task:Sync hours:6 obj:Descansar\n\nDISCLAIMER_TEXT');
  });
});

describe('stepAnswered (puerta de validación por nodo)', () => {
  const empty = { task: '', hours: null, objective: '' };

  it('nodo 1 exige tarea rellenada (los espacios solo no cuentan)', () => {
    expect(stepAnswered(1, empty)).toBeFalse();
    expect(stepAnswered(1, { ...empty, task: '   ' })).toBeFalse();
    expect(stepAnswered(1, { ...empty, task: 'Sincronizar pedidos' })).toBeTrue();
  });

  it('nodo 2 exige horas válidas (0 no cuenta)', () => {
    expect(stepAnswered(2, empty)).toBeFalse();
    expect(stepAnswered(2, { ...empty, hours: 0 })).toBeFalse();
    expect(stepAnswered(2, { ...empty, hours: 6 })).toBeTrue();
  });

  it('nodo 3 exige objetivo rellenado', () => {
    expect(stepAnswered(3, empty)).toBeFalse();
    expect(stepAnswered(3, { ...empty, objective: '   ' })).toBeFalse();
    expect(stepAnswered(3, { ...empty, objective: 'Descansar' })).toBeTrue();
  });

  it('nodo 4 (output) no tiene puerta', () => {
    expect(stepAnswered(4, empty)).toBeTrue();
  });
});

describe('N8nWorkflowService (máquina de estados del workflow)', () => {
  function service(): N8nWorkflowService {
    return TestBed.inject(N8nWorkflowService);
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

  it('arranca en el nodo 1 (Webhook) con las respuestas vacías', () => {
    const wizard = service();
    expect(wizard.step()).toBe(1);
    expect(wizard.answers()).toEqual({ task: '', hours: null, objective: '' });
    expect(wizard.pendingLead()).toBeNull();
  });

  it('los setters registran las respuestas de las tres tarjetas', () => {
    const wizard = service();
    wizard.setTask('Sincronizar pedidos');
    wizard.setHours(6);
    wizard.setObjective('Cerrar más clientes');
    expect(wizard.answers()).toEqual({
      task: 'Sincronizar pedidos',
      hours: 6,
      objective: 'Cerrar más clientes'
    });
  });

  it('setHours(null) limpia el tiempo registrado', () => {
    const wizard = service();
    wizard.setHours(6);
    wizard.setHours(null);
    expect(wizard.answers().hours).toBeNull();
  });

  it('next() avanza nodo a nodo hasta el output y no pasa del último', () => {
    const wizard = service();
    wizard.next();
    expect(wizard.step()).toBe(2);
    wizard.next();
    expect(wizard.step()).toBe(3);
    wizard.next();
    expect(wizard.step()).toBe(4);
    wizard.next();
    expect(wizard.step()).toBe(4);
  });

  it('back() retrocede nodo a nodo y es un no-op en el primero', () => {
    const wizard = service();
    wizard.back();
    expect(wizard.step()).toBe(1);
    wizard.next();
    wizard.next();
    wizard.next();
    expect(wizard.step()).toBe(4);
    wizard.back();
    expect(wizard.step()).toBe(3);
  });

  it('reset() restaura el estado inicial completo y limpia el lead', () => {
    const wizard = service();
    wizard.setTask('Tarea');
    wizard.setHours(3);
    wizard.setObjective('Objetivo');
    wizard.next();
    wizard.next();
    wizard.next();
    wizard.prepareLead();
    wizard.reset();
    expect(wizard.step()).toBe(1);
    expect(wizard.answers()).toEqual({ task: '', hours: null, objective: '' });
    expect(wizard.pendingLead()).toBeNull();
  });

  it('prepareLead compone el mensaje con tarea, horas y objetivo + descargo', () => {
    const wizard = service();
    wizard.setTask('Sincronizar pedidos');
    wizard.setHours(6);
    wizard.setObjective('Descansar los viernes');
    const lead = wizard.prepareLead();
    expect(lead!.message).toBe(
      'LEAD task:Sincronizar pedidos hours:6 obj:Descansar los viernes\n\nDISCLAIMER_TEXT'
    );
    expect(wizard.pendingLead()).toEqual(lead);
  });

  it('consumePendingLead entrega el lead una sola vez y lo limpia', () => {
    const wizard = service();
    wizard.setTask('Tarea');
    wizard.setHours(2);
    wizard.setObjective('Objetivo');
    const lead = wizard.prepareLead();
    expect(lead).not.toBeNull();

    const consumed = wizard.consumePendingLead();
    expect(consumed).toEqual(lead);
    expect(wizard.pendingLead()).toBeNull();
    expect(wizard.consumePendingLead()).toBeNull();
  });
});
