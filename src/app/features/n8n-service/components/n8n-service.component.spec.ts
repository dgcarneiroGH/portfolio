import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { axe } from 'jasmine-axe';
import { firstValueFrom, of } from 'rxjs';
import { N8nServiceComponent } from './n8n-service.component';
import { N8nWorkflowService } from './n8n-workflow.service';

// Copia exacta en español del prototipo de Figma: el spec es el archivo de
// referencia del copy del workflow n8n.
const esN8n: Record<string, string> = {
  'N8N_WIZARD.TITLE': 'Configura tu solución con',
  'N8N_WIZARD.TITLE_HIGHLIGHT': 'n8n',
  'N8N_WIZARD.SUBTITLE':
    'Responde a 3 preguntas en nuestro lienzo de nodos y descubre cómo recuperar horas cada semana con flujos automáticos.',
  'N8N_WIZARD.BACK': 'Atrás',
  'N8N_WIZARD.RESTART': 'Volver a configurar',
  'N8N_WIZARD.A11Y_NEXT_NODE': 'Avanzar al siguiente nodo',
  'N8N_WIZARD.STEPS.TASK.TITLE': '¿Qué tarea repetitiva te molesta más?',
  'N8N_WIZARD.STEPS.TASK.DESCRIPTION':
    'Identifica el proceso manual que más fricción genera en tu rutina o en tu negocio para que el webhook lo intercepte.',
  'N8N_WIZARD.STEPS.TASK.LABEL': 'Tarea repetitiva que quieres automatizar',
  'N8N_WIZARD.STEPS.TASK.PLACEHOLDER': 'Ej: Todos los lunes tengo que sincronizar manualmente los pedidos de Shopify...',
  'N8N_WIZARD.STEPS.TASK.CTA': 'Siguiente nodo',
  'N8N_WIZARD.STEPS.HOURS.TITLE': '¿Cuánto tiempo a la semana ocupas en esa tarea?',
  'N8N_WIZARD.STEPS.HOURS.DESCRIPTION':
    'Calcula una estimación aproximada de horas dedicadas para parametrizar el retorno de inversión y el ahorro en ejecuciones n8n.',
  'N8N_WIZARD.STEPS.HOURS.LABEL': 'Horas a la semana que ocupa la tarea',
  'N8N_WIZARD.STEPS.HOURS.PLACEHOLDER': '10',
  'N8N_WIZARD.STEPS.HOURS.SUFFIX': 'Horas / sem',
  'N8N_WIZARD.STEPS.HOURS.CTA': 'Siguiente nodo',
  'N8N_WIZARD.STEPS.OBJECTIVE.TITLE':
    '¿Qué te gustaría hacer si te digo que te puedo devolver ese tiempo?',
  'N8N_WIZARD.STEPS.OBJECTIVE.DESCRIPTION':
    'El propósito de automatizar no es acumular nodos ni scripts, es reconquistar tu tiempo y foco para lo que de verdad mueve la aguja.',
  'N8N_WIZARD.STEPS.OBJECTIVE.LABEL': 'Qué harías con el tiempo recuperado',
  'N8N_WIZARD.STEPS.OBJECTIVE.PLACEHOLDER': 'Ej: Dedicarme a cerrar más clientes comerciales...',
  'N8N_WIZARD.STEPS.OBJECTIVE.CTA': 'Generar diagnóstico de automatización',
  'N8N_WIZARD.RESULT.HEADLINE':
    'Te ayudaré a automatizar esa tarea con n8n, te daré el coste mensual de hosting y algo más que necesites',
  'N8N_WIZARD.RESULT.SUBTITLE':
    'Hemos consolidado las variables de tu flujo. Aquí tienes la arquitectura base lista para implementar sin costes inflados ni dependencias propietarias:',
  'N8N_WIZARD.RESULT.BREAKDOWN_LABEL': 'Arquitectura base del flujo',
  'N8N_WIZARD.RESULT.ITEM_1_TITLE': 'Flujo personalizado en n8n auto-alojado o cloud',
  'N8N_WIZARD.RESULT.ITEM_1_DESC': 'Diseñado con modularidad, alertas por fallo e idempotencia ante errores.',
  'N8N_WIZARD.RESULT.ITEM_2_TITLE': 'Coste de infraestructura optimizado (~0€ - 5€/mes)',
  'N8N_WIZARD.RESULT.ITEM_2_DESC': 'Despliegue ligero en VPS eliminando las tarifas por ejecución de Zapier o Make.',
  'N8N_WIZARD.RESULT.ITEM_3_TITLE': 'Documentación paso a paso y sin cajas negras',
  'N8N_WIZARD.RESULT.ITEM_3_DESC': 'Tu equipo mantiene control pleno del código, los webhooks y las credenciales API.',
  'N8N_WIZARD.RESULT.CTA': 'Quiero que hagamos esto',
  'N8N_WIZARD.DISCLAIMER': 'Oferta no vinculante: evaluamos juntos la viabilidad técnica antes de empezar.',
  'N8N_WIZARD.MESSAGES.LEAD':
    'Hola Nomacoda, he configurado mi flujo con n8n:\n• Tarea repetitiva a automatizar: {{task}}\n• Tiempo que consume hoy: {{hours}} h/semana\n• Qué haría con ese tiempo recuperado: {{objective}}\nMe gustaría que montáramos este flujo juntos y conocer el coste mensual de hosting.'
};

const mockLoader = {
  getTranslation: () => of(esN8n)
};

// Ventana de transición del carril (slide 1.4s + cola): los tests que
// atraviesan cambios de nodo adelantan el reloj de Jasmine este valor.
const TICK_MS = 1501;

describe('N8nServiceComponent', () => {
  let fixture: ComponentFixture<N8nServiceComponent>;
  let component: N8nServiceComponent;
  let workflow: N8nWorkflowService;
  let router: Router;

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const slide = (n: number): HTMLElement =>
    el().querySelector<HTMLElement>(`#n8n-slide-${n}`)!;
  const activeHeading = (): HTMLElement | null =>
    el().querySelector(`#n8n-slide-${workflow.step()} [data-n8n-heading]`);
  const activeNext = (): HTMLButtonElement | null =>
    el().querySelector<HTMLButtonElement>(`#n8n-slide-${workflow.step()} .n8n-next`);
  const track = (): HTMLElement => el().querySelector<HTMLElement>('.n8n-track')!;

  function typeInto(
    selector: string,
    value: string
  ): HTMLInputElement | HTMLTextAreaElement {
    const input = el().querySelector<HTMLInputElement | HTMLTextAreaElement>(
      selector
    )!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    return input;
  }

  function typeHours(value: string): void {
    typeInto('#n8n-input-hours', value);
  }

  /**
   * Avanza por los CTAs hasta el output. La puerta de validación exige los
   * tres campos rellenados y la ventana de transición (700 ms) bloquea clics
   * consecutivos: se rellena cada nodo y se adelanta el reloj de Jasmine
   * entre pasos.
   */
  function reachResult(): void {
    jasmine.clock().install();
    typeInto('#n8n-input-task', 'Sincronizar pedidos de Shopify');
    activeNext()!.click();
    fixture.detectChanges();
    jasmine.clock().tick(TICK_MS);
    fixture.detectChanges();

    typeHours('6');
    activeNext()!.click();
    fixture.detectChanges();
    jasmine.clock().tick(TICK_MS);
    fixture.detectChanges();

    typeInto('#n8n-input-objective', 'Descansar los viernes');
    activeNext()!.click();
    fixture.detectChanges();
    jasmine.clock().tick(TICK_MS);
    fixture.detectChanges();

    // Se desinstala antes de volver: axe y whenStable usan timers reales.
    jasmine.clock().uninstall();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        N8nServiceComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(N8nServiceComponent);
    component = fixture.componentInstance;
    workflow = TestBed.inject(N8nWorkflowService);
    router = TestBed.inject(Router);

    // Zoneless + loader async: cargo el idioma y estabilizo para que
    // ngx-translate resuelva las claves antes de cualquier aserción.
    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    try {
      jasmine.clock().uninstall();
    } catch {
      // Sin reloj instalado (reachResult ya lo desinstaló).
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Introducción y estructura de workflow', () => {
    it('muestra el título con el highlight de n8n y el subtítulo', () => {
      expect(
        el().querySelector('.n8n-title')?.textContent?.replace(/\s+/g, ' ').trim()
      ).toContain('Configura tu solución con n8n');
      expect(el().querySelector('.n8n-intro__subtitle')?.textContent).toContain(
        'lienzo de nodos'
      );
    });

    it('renderiza las 4 tarjetas-nodo en el carril (3 preguntas + output)', () => {
      expect(el().querySelectorAll('.n8n-slide').length).toBe(4);
      expect(slide(1).querySelector('[data-n8n-heading]')?.textContent).toContain(
        '¿Qué tarea repetitiva te molesta más?'
      );
      expect(slide(2).querySelector('[data-n8n-heading]')?.textContent).toContain(
        '¿Cuánto tiempo a la semana ocupas en esa tarea?'
      );
      expect(slide(3).querySelector('[data-n8n-heading]')?.textContent).toContain(
        '¿Qué te gustaría hacer si te digo que te puedo devolver ese tiempo?'
      );
      expect(slide(4).querySelector('.n8n-result__headline')?.textContent).toContain(
        'Te ayudaré a automatizar esa tarea con n8n'
      );
    });

    it('no muestra los puntos tipo carrusel del diseño', () => {
      expect(el().querySelector('.n8n-dots')).toBeNull();
    });

    it('cada tarjeta pregunta está conectada a la siguiente por un cable (línea que separa los nodos)', () => {
      // Medio cable a la salida (slides 1-3) y a la entrada (slides 2-4).
      expect(el().querySelectorAll('.n8n-slide .n8n-wire--out').length).toBe(3);
      expect(el().querySelectorAll('.n8n-slide .n8n-wire--in').length).toBe(3);
      // El primer nodo no tiene cable de entrada y el último no de salida.
      expect(slide(1).querySelector('.n8n-wire--in')).toBeNull();
      expect(slide(4).querySelector('.n8n-wire--out')).toBeNull();
    });

    it('el carril arranca en el primer nodo (transform inicial 0)', () => {
      expect(track().style.transform).toBe('translateX(0%)');
    });
  });

  describe('Sin cinta de minimapas', () => {
    it('no muestra la cinta de mini-nodos (retirada: el progreso lo dan los contadores)', () => {
      expect(el().querySelector('.n8n-ribbon')).toBeNull();
    });
  });

  describe('Transición y head del output', () => {
    it('la transición del carril dura 1.4s (mucho más lenta, decisión 2026-11-21)', () => {
      expect(getComputedStyle(track()).transitionDuration).toBe('1.4s');
    });

    it('el output se titula Respond to Webhook (head del nodo n8n real)', () => {
      expect(slide(4).querySelector('.n8n-node__name')?.textContent?.trim()).toBe(
        'Respond to Webhook'
      );
    });
  });

  describe('Navegación entre tarjetas', () => {
    it('"Siguiente nodo" desliza el carril al siguiente nodo', () => {
      typeInto('#n8n-input-task', 'Sincronizar pedidos de Shopify');

      activeNext()!.click();
      fixture.detectChanges();

      expect(workflow.step()).toBe(2);
      expect(track().style.transform).toBe('translateX(-100%)');
    });

    it('"Atrás" vuelve al nodo anterior desde los pasos 2 y 3', () => {
      jasmine.clock().install();
      activeNext()!.click();
      fixture.detectChanges();
      jasmine.clock().tick(TICK_MS);
      fixture.detectChanges();

      slide(2).querySelector<HTMLButtonElement>('.n8n-back')!.click();
      fixture.detectChanges();
      jasmine.clock().tick(TICK_MS);
      fixture.detectChanges();
      expect(workflow.step()).toBe(1);

      // Sin cinta: se llega al nodo 3 navegando con los CTAs del servicio.
      workflow.next();
      workflow.next();
      fixture.detectChanges();
      slide(3).querySelector<HTMLButtonElement>('.n8n-back')!.click();
      fixture.detectChanges();
      jasmine.clock().tick(TICK_MS);
      fixture.detectChanges();
      expect(workflow.step()).toBe(2);
    });

    it('no existe botón "Atrás" en el primer nodo', () => {
      expect(slide(1).querySelector('.n8n-back')).toBeNull();
    });

    it('bloquea el avance doble mientras dura la transición', () => {
      jasmine.clock().install();
      typeInto('#n8n-input-task', 'Sincronizar pedidos de Shopify');

      activeNext()!.click();
      fixture.detectChanges();
      expect(workflow.step()).toBe(2);

      // Doble clic durante la ventana de transición: no avanza otra vez.
      slide(2).querySelector<HTMLButtonElement>('.n8n-next')!.click();
      fixture.detectChanges();
      expect(workflow.step()).toBe(2);

      jasmine.clock().tick(TICK_MS);
      fixture.detectChanges();
      typeHours('6');
      slide(2).querySelector<HTMLButtonElement>('.n8n-next')!.click();
      fixture.detectChanges();
      expect(workflow.step()).toBe(3);
    });

    it('durante la transición los cables se animan (clase flowing) y luego se retira', () => {
      jasmine.clock().install();
      typeInto('#n8n-input-task', 'Sincronizar pedidos de Shopify');

      expect(track().classList.contains('n8n-track--flowing')).toBeFalse();
      activeNext()!.click();
      fixture.detectChanges();
      expect(track().classList.contains('n8n-track--flowing')).toBeTrue();

      jasmine.clock().tick(TICK_MS);
      fixture.detectChanges();
      expect(track().classList.contains('n8n-track--flowing')).toBeFalse();
    });

    it('mueve el foco al encabezado del nuevo nodo al avanzar', () => {
      typeInto('#n8n-input-task', 'Sincronizar pedidos de Shopify');
      activeNext()!.click();
      fixture.detectChanges();

      expect(document.activeElement).toBe(activeHeading());
      expect(activeHeading()!.textContent).toContain(
        '¿Cuánto tiempo a la semana ocupas en esa tarea?'
      );
    });
  });

  describe('Puerta de validación (CTA/pin deshabilitados hasta rellenar)', () => {
    const ctaOf = (n: number): HTMLButtonElement =>
      slide(n).querySelector<HTMLButtonElement>('.n8n-next')!;
    const pinOf = (n: number): HTMLButtonElement =>
      slide(n).querySelector<HTMLButtonElement>('.n8n-pin--out')!;

    it('nodo 1: CTA y pin deshabilitados sin tarea; habilitados al rellenarla', () => {
      expect(ctaOf(1).disabled).toBeTrue();
      expect(pinOf(1).disabled).toBeTrue();

      typeInto('#n8n-input-task', 'Sincronizar pedidos');

      expect(ctaOf(1).disabled).toBeFalse();
      expect(pinOf(1).disabled).toBeFalse();
    });

    it('nodo 1: una tarea de solo espacios cuenta como vacía', () => {
      typeInto('#n8n-input-task', '   ');
      expect(ctaOf(1).disabled).toBeTrue();
    });

    it('nodo 1: un clic en el CTA deshabilitado no avanza el workflow', () => {
      ctaOf(1).click();
      fixture.detectChanges();

      expect(workflow.step()).toBe(1);
      expect(track().style.transform).toBe('translateX(0%)');
    });

    it('nodo 2: el CTA requiere horas válidas (0 no vale)', () => {
      workflow.next(); // navegación de servicio: la puerta vive en la UI
      fixture.detectChanges();

      typeInto('#n8n-input-hours', '0');
      expect(ctaOf(2).disabled).toBeTrue();
      expect(pinOf(2).disabled).toBeTrue();

      typeInto('#n8n-input-hours', '6');
      expect(ctaOf(2).disabled).toBeFalse();
      expect(pinOf(2).disabled).toBeFalse();
    });

    it('nodo 3: el CTA requiere objetivo', () => {
      workflow.next();
      workflow.next();
      fixture.detectChanges();

      expect(ctaOf(3).disabled).toBeTrue();
      expect(pinOf(3).disabled).toBeTrue();

      typeInto('#n8n-input-objective', 'Descansar los viernes');
      expect(ctaOf(3).disabled).toBeFalse();
      expect(pinOf(3).disabled).toBeFalse();
    });

    it('"Atrás" nunca se deshabilita', () => {
      workflow.next();
      fixture.detectChanges();

      expect(slide(2).querySelector<HTMLButtonElement>('.n8n-back')!.disabled)
        .toBeFalse();
    });
  });

  describe('Respuestas de las tarjetas', () => {
    it('el textarea del nodo Webhook registra la tarea repetitiva', () => {
      const textarea = el().querySelector<HTMLTextAreaElement>('#n8n-input-task')!;
      textarea.value = 'Sincronizar pedidos de Shopify';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(workflow.answers().task).toBe('Sincronizar pedidos de Shopify');
    });

    it('el input de horas filtra todo lo que no sean dígitos', () => {
      typeHours('6a7');
      expect(workflow.answers().hours).toBe(67);
      expect(el().querySelector<HTMLInputElement>('#n8n-input-hours')!.value).toBe('67');
    });

    it('el input de horas queda vacío si solo hay letras o cero', () => {
      typeHours('abc');
      expect(workflow.answers().hours).toBeNull();

      typeHours('0');
      expect(workflow.answers().hours).toBeNull();
    });

    it('el input de horas acota por arriba a 120', () => {
      typeHours('250');
      expect(workflow.answers().hours).toBe(120);
    });

    it('el textarea del nodo Target Impact registra el objetivo', () => {
      const textarea = el().querySelector<HTMLTextAreaElement>('#n8n-input-objective')!;
      textarea.value = 'Descansar los viernes';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(workflow.answers().objective).toBe('Descansar los viernes');
    });
  });

  describe('Output de ejecución y contacto', () => {
    it('"Generar diagnóstico" llega al output con el desglose de arquitectura', () => {
      reachResult();

      expect(workflow.step()).toBe(4);
      expect(track().style.transform).toBe('translateX(-300%)');
      expect(slide(4).querySelector('.n8n-result__headline')?.textContent).toContain(
        'Te ayudaré a automatizar esa tarea con n8n'
      );
      expect(slide(4).querySelectorAll('.n8n-result__item').length).toBe(3);
    });

    it('el CTA del output guarda el lead y navega a /contact', () => {
      reachResult();

      spyOn(router, 'navigate');
      slide(4).querySelector<HTMLButtonElement>('.n8n-cta-contact')!.click();
      fixture.detectChanges();

      const routerSpy = router as unknown as { navigate: jasmine.Spy };
      expect(workflow.pendingLead()).not.toBeNull();
      expect(workflow.pendingLead()!.message).toContain(
        'Tarea repetitiva a automatizar: Sincronizar pedidos de Shopify'
      );
      expect(workflow.pendingLead()!.message).toContain('Tiempo que consume hoy: 6 h/semana');
      expect(workflow.pendingLead()!.message).toContain(
        'Oferta no vinculante: evaluamos juntos la viabilidad técnica antes de empezar.'
      );
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/contact']);
    });

    it('el mensaje preconstruido no se renderiza en el DOM', () => {
      reachResult();
      expect(el().textContent).not.toContain('Hola Nomacoda, he configurado mi flujo');
    });

    it('"Volver a configurar" reinicia el workflow al primer nodo', () => {
      reachResult();
      slide(4).querySelector<HTMLButtonElement>('.n8n-restart')!.click();
      fixture.detectChanges();

      expect(workflow.step()).toBe(1);
      expect(workflow.answers()).toEqual({ task: '', hours: null, objective: '' });
      expect(track().style.transform).toBe('translateX(0%)');
    });

    it('Escape en el output reinicia el workflow', () => {
      reachResult();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(workflow.step()).toBe(1);
    });
  });

  describe('Accesibilidad', () => {
    it('los pins de salida son botones con nombre accesible', () => {
      const pin = slide(1).querySelector<HTMLButtonElement>('.n8n-pin--out')!;
      expect(pin.getAttribute('aria-label')).toContain('Avanzar al siguiente nodo');
    });

    it('los controles tienen etiqueta accesible', () => {
      expect(el().querySelector('label[for="n8n-input-task"]')).not.toBeNull();
      expect(el().querySelector('label[for="n8n-input-hours"]')).not.toBeNull();
      expect(el().querySelector('label[for="n8n-input-objective"]')).not.toBeNull();
    });

    it('el anillo de foco del input usa el rosa n8n (no mint ni azul global)', () => {
      // El input vive en el nodo 2: hay que llegar a él para poder focarlo
      // (los slides inactivos son inert, no focables) y la puerta de
      // validación exige rellenar la tarea antes de poder avanzar.
      jasmine.clock().install();
      typeInto('#n8n-input-task', 'Sincronizar pedidos de Shopify');
      activeNext()!.click();
      fixture.detectChanges();
      jasmine.clock().tick(TICK_MS);
      fixture.detectChanges();

      const input = el().querySelector<HTMLInputElement>('#n8n-input-hours')!;
      input.focus();
      fixture.detectChanges();

      const shadow = getComputedStyle(input).boxShadow;
      expect(shadow).toContain('rgb(234, 75, 113)'); // $n8n-rose (marca oficial n8n)
      expect(shadow).not.toContain('rgb(142, 212, 194)'); // $green-soft (mint)
      expect(shadow).not.toContain('rgb(0, 95, 204)'); // $accent-blue (global)
    });

    it('nodo Webhook sin violaciones axe (WCAG 2.1/2.2 AA)', async () => {
      await fixture.whenStable();
      try {
        const result = await axe(el(), { rules: { 'color-contrast': { enabled: false } } });
        expect(result).toHaveNoViolations();
      } catch (err) {
        console.warn('[a11y] axe-core no disponible:', err);
        pending('axe-core incompatible con el entorno de test actual');
      }
    });

    it('output de ejecución sin violaciones axe (WCAG 2.1/2.2 AA)', async () => {
      reachResult();
      await fixture.whenStable();
      try {
        const result = await axe(el(), { rules: { 'color-contrast': { enabled: false } } });
        expect(result).toHaveNoViolations();
      } catch (err) {
        console.warn('[a11y] axe-core no disponible:', err);
        pending('axe-core incompatible con el entorno de test actual');
      }
    });
  });

  describe('Accesibilidad — auditoría WCAG (2026-11-21)', () => {
    it('los literales técnicos de los nodos llevan lang="en" (3.1.2)', () => {
      for (let n = 1; n <= 4; n++) {
        const titles = slide(n).querySelector('.n8n-node__titles');
        expect(titles?.getAttribute('lang')).toBe('en');
      }
    });

    it('los campos obligatorios declaran aria-required (3.3.2)', () => {
      for (const id of ['n8n-input-task', 'n8n-input-hours', 'n8n-input-objective']) {
        expect(el().querySelector(`#${id}`)?.getAttribute('aria-required')).toBe('true');
      }
    });

    it('los literales técnicos anunciados están en inglés real', () => {
      expect(slide(2).querySelector('.n8n-node__name')?.textContent?.trim()).toBe('HTTP Request');
      expect(slide(3).querySelector('.n8n-node__name')?.textContent?.trim()).toBe('Wait');
    });

    it('el breakdown del output es una lista semántica con 3 elementos', () => {
      const list = slide(4).querySelector('ul.n8n-result__breakdown');
      expect(list).not.toBeNull();
      expect(list?.querySelectorAll('li.n8n-result__item').length).toBe(3);
    });
  });
});
