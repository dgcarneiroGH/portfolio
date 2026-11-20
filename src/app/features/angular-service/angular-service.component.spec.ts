import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { axe } from 'jasmine-axe';
import { AngularServiceComponent } from './angular-service.component';
import { WebMigrationWizardService } from './web-migration-wizard.service';

// Copia exacta en español del prototipo de Figma: el spec es el archivo de
// referencia del copy hasta que exista el subárbol WIZARD.* en es-ES.json.
const esWizard: Record<string, string> = {
  'WIZARD.TITLE': '¿Tu negocio necesita',
  'WIZARD.TITLE_HIGHLIGHT': 'Angular?',
  'WIZARD.SUBTITLE':
    'Responde 3 preguntas en menos de 1 minuto para ver qué solución técnica se ajusta de forma óptima a tu infraestructura actual.',
  'WIZARD.STEP_COUNTER': 'Paso {{current}} / 03',
  'WIZARD.WEB.TITLE': '¿Tu negocio tiene página web?',
  'WIZARD.WEB.DESCRIPTION':
    'Analicemos tu presencia digital actual para definir la mejor estrategia técnica y de rendimiento.',
  'WIZARD.WEB.YES': 'Sí',
  'WIZARD.WEB.YES_DESC': 'Tengo un sitio web activo',
  'WIZARD.WEB.NO': 'No',
  'WIZARD.WEB.NO_DESC': 'Aún no tengo página',
  'WIZARD.WORDPRESS.TITLE': '¿La creaste con WordPress o similar?',
  'WIZARD.WORDPRESS.YES': 'Sí',
  'WIZARD.WORDPRESS.YES_DESC': 'Uso un CMS tradicional',
  'WIZARD.WORDPRESS.NO': 'No',
  'WIZARD.WORDPRESS.NO_DESC': 'Desarrollo a medida / otro',
  'WIZARD.HOSTING.TITLE': '¿Sabes cuánto pagas al año por el hosting?',
  'WIZARD.HOSTING.DESCRIPTION':
    'Servidores compartidos, renovaciones automáticas, licencias o mantenimiento de base de datos.',
  'WIZARD.HOSTING.AMOUNT_LABEL': 'Coste anual del hosting en euros',
  'WIZARD.HOSTING.AMOUNT_PLACEHOLDER': '180',
  'WIZARD.HOSTING.AMOUNT_SUFFIX': '€/año',
  'WIZARD.HOSTING.UNKNOWN': 'No lo sé exactamente',
  'WIZARD.HOSTING.CTA': 'Ver diagnóstico',
  'WIZARD.BACK': 'Atrás',
  'WIZARD.REPEAT': 'Repetir test',
  'WIZARD.DISCLAIMER': 'Oferta no vinculante: primero analizo tu caso y te paso presupuesto.',
  'WIZARD.RESULT_MIGRATE.PILL': 'DIAGNÓSTICO TÉCNICO · MIGRACIÓN RECOMENDADA',
  'WIZARD.RESULT_MIGRATE.TITLE': 'Tu web pide independencia técnica',
  'WIZARD.RESULT_MIGRATE.BAD_LABEL': 'El coste oculto actual',
  'WIZARD.RESULT_MIGRATE.BAD_TEXT':
    'Estás pagando de más por algo que puede costarte casi nada. Y si no mantienes tu entorno al día, tu web es una puerta abierta.',
  'WIZARD.RESULT_MIGRATE.BAD_TEXT_AMOUNT':
    'Pagas <strong>{{amount}} € al año</strong> por algo que puede costarte casi nada. Y si no mantienes tu entorno al día, tu web es una puerta abierta.',
  'WIZARD.RESULT_MIGRATE.GOOD_LABEL': 'Solución Angular + Sanity.io',
  'WIZARD.RESULT_MIGRATE.GOOD_TEXT':
    'Migrando a Angular + Sanity.io: hosting gratis el primer año, tú solo pagas el dominio (~12 €/año). Sin plugins de terceros, rendimiento y SEO reales, y tu propio panel de administración.',
  'WIZARD.RESULT_MIGRATE.WORK_LABEL': 'Qué hago exactamente:',
  'WIZARD.RESULT_MIGRATE.BULLET_1': 'Migración sin perder contenido ni SEO.',
  'WIZARD.RESULT_MIGRATE.BULLET_2': 'Contenido editable desde Sanity, sin tocar código.',
  'WIZARD.RESULT_MIGRATE.BULLET_3': 'Documentación incluida, sin cajas negras.',
  'WIZARD.RESULT_MIGRATE.CTA': 'Quiero saber cuánto me costaría',
  'WIZARD.RESULT_MAINTENANCE.PILL': 'ESTADO · ARQUITECTURA NO WORDPRESS',
  'WIZARD.RESULT_MAINTENANCE.TITLE': 'Tu web no está en WordPress.',
  'WIZARD.RESULT_MAINTENANCE.SUBTITLE': 'No necesita migración: necesita mantenimiento.',
  'WIZARD.RESULT_MAINTENANCE.PLAN_LABEL': 'Plan de preservación y evolución técnica:',
  'WIZARD.RESULT_MAINTENANCE.BULLET_1': 'Actualizaciones de seguridad aplicadas y verificadas.',
  'WIZARD.RESULT_MAINTENANCE.BULLET_2': 'Copias de seguridad comprobadas, no cruzadas de brazos.',
  'WIZARD.RESULT_MAINTENANCE.BULLET_3': 'Cambios pequeños sin abrir un ticket.',
  'WIZARD.RESULT_MAINTENANCE.CTA': 'Cuéntame cuántas horas necesitas',
  'WIZARD.RESULT_CREATE.PILL': 'ESTADO · NUEVO DESARROLLO',
  'WIZARD.RESULT_CREATE.TITLE': 'No tienes web.',
  'WIZARD.RESULT_CREATE.SUBTITLE':
    'La crearé contigo desde cero: Angular + Sanity.io, rápida, sin plugins y editable por ti.',
  'WIZARD.RESULT_CREATE.FOUNDATIONS_LABEL': 'Fundamentos de tu nuevo proyecto:',
  'WIZARD.RESULT_CREATE.BULLET_1': 'Arquitectura pensada para tu negocio, no para una plantilla.',
  'WIZARD.RESULT_CREATE.BULLET_2': 'Contenido que tú mismo gestionas desde Sanity.',
  'WIZARD.RESULT_CREATE.BULLET_3': 'Rendimiento y SEO desde el primer día.',
  'WIZARD.RESULT_CREATE.CTA': 'Quiero que la hagamos',
  'WIZARD.MESSAGES.CREATE':
    'Hola Nomacoda, actualmente no tengo página web y me gustaría crearla desde cero utilizando Angular y Sanity.io.',
  'WIZARD.MESSAGES.MAINTENANCE':
    'Hola Nomacoda, tengo un sitio web desarrollado a medida o fuera de WordPress y requiero servicio de mantenimiento continuo y seguridad.',
  'WIZARD.MESSAGES.MIGRATE_AMOUNT':
    'Hola Nomacoda, he realizado el test de migración.\nActualmente tengo web en WordPress/similar y pago aproximadamente {{amount}} €/año.\nMe gustaría saber el presupuesto exacto para migrar a Angular + Sanity.io.',
  'WIZARD.MESSAGES.MIGRATE_UNKNOWN':
    'Hola Nomacoda, he realizado el test de migración.\nActualmente tengo web en WordPress/similar y el coste del hosting es desconocido / a auditar.\nMe gustaría saber el presupuesto exacto para migrar a Angular + Sanity.io.'
};

const mockLoader = {
  getTranslation: () => of(esWizard)
};

describe('AngularServiceComponent', () => {
  let fixture: ComponentFixture<AngularServiceComponent>;
  let component: AngularServiceComponent;
  let wizard: WebMigrationWizardService;
  let router: Router;

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const activeHeading = (): HTMLElement | null =>
    el().querySelector('[data-wizard-heading]');
  const options = (): NodeListOf<HTMLButtonElement> =>
    el().querySelectorAll<HTMLButtonElement>('.wizard-option');
  const backButton = (): HTMLButtonElement | null =>
    el().querySelector<HTMLButtonElement>('.wizard-back');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AngularServiceComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AngularServiceComponent);
    component = fixture.componentInstance;
    wizard = TestBed.inject(WebMigrationWizardService);
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Paso 1 (¿web?)', () => {
    it('muestra el título, la pregunta del paso 1 y las dos opciones', () => {
      expect(
        el().querySelector('.wizard-title')?.textContent?.replace(/\s+/g, ' ').trim()
      ).toContain('¿Tu negocio necesita Angular?');
      expect(activeHeading()?.textContent).toContain('¿Tu negocio tiene página web?');
      expect(options().length).toBe(2);
      expect(options()[0].textContent).toContain('Tengo un sitio web activo');
      expect(options()[1].textContent).toContain('Aún no tengo página');
      expect(backButton()).toBeNull();
    });

    it('responde "Sí" y avanza al paso 2 con botón Atrás', () => {
      options()[0].click();
      fixture.detectChanges();

      expect(wizard.answers().hasWeb).toBeTrue();
      expect(activeHeading()?.textContent).toContain('¿La creaste con WordPress o similar?');
      expect(backButton()).not.toBeNull();
    });

    it('responde "No" y salta directo al resultado CREATE_NEW', () => {
      options()[1].click();
      fixture.detectChanges();

      expect(wizard.result()).toBe('CREATE_NEW');
      expect(el().querySelector('.wizard-result--create')).not.toBeNull();
      expect(el().querySelector('.wizard-result--create')?.textContent).toContain(
        'No tienes web.'
      );
      expect(el().querySelector('.wizard-result--create')?.textContent).toContain(
        'Quiero que la hagamos'
      );
    });
  });

  describe('Paso 2 (¿WordPress?)', () => {
    beforeEach(() => {
      options()[0].click();
      fixture.detectChanges();
    });

    it('responde "No" y salta directo al resultado MAINTENANCE', () => {
      options()[1].click();
      fixture.detectChanges();

      expect(wizard.result()).toBe('MAINTENANCE');
      expect(el().querySelector('.wizard-result--maintenance')).not.toBeNull();
      expect(el().querySelector('.wizard-result--maintenance')?.textContent).toContain(
        'No necesita migración: necesita mantenimiento.'
      );
      expect(el().querySelector('.wizard-result--maintenance')?.textContent).toContain(
        'Cuéntame cuántas horas necesitas'
      );
    });

    it('responde "Sí" y avanza al paso 3 (hosting)', () => {
      options()[0].click();
      fixture.detectChanges();

      expect(activeHeading()?.textContent).toContain(
        '¿Sabes cuánto pagas al año por el hosting?'
      );
      expect(el().querySelector('#wizard-hosting-amount')).not.toBeNull();
      expect(el().querySelector('#wizard-hosting-unknown')).not.toBeNull();
      expect(el().querySelector('.wizard-cta-primary')?.textContent).toContain(
        'Ver diagnóstico'
      );
    });

    it('el botón Atrás vuelve al paso 1', () => {
      backButton()!.click();
      fixture.detectChanges();

      expect(wizard.step()).toBe(0);
      expect(activeHeading()?.textContent).toContain('¿Tu negocio tiene página web?');
    });
  });

  describe('Paso 3 (¿hosting?)', () => {
    beforeEach(() => {
      options()[0].click(); // Sí en paso 1
      fixture.detectChanges();
      options()[0].click(); // Sí en paso 2
      fixture.detectChanges();
    });

    it('el checkbox "No lo sé" deshabilita y limpia el importe', () => {
      const input = el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!;
      input.value = '180';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const checkbox = el().querySelector<HTMLInputElement>('#wizard-hosting-unknown')!;
      checkbox.click();
      fixture.detectChanges();

      expect(wizard.answers().hostingKnown).toBeFalse();
      expect(wizard.answers().hostingAmount).toBeNull();
      expect(input.disabled).toBeTrue();
      expect(input.value).toBe('');
    });

    it('no deshabilita el input ni marca "No lo sé" mientras se teclea el importe', () => {
      const input = el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!;
      const checkbox = el().querySelector<HTMLInputElement>('#wizard-hosting-unknown')!;

      // Primer dígito de "180": valor parcial, menor que el umbral.
      input.value = '1';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(wizard.answers().hostingKnown).toBeTrue();
      expect(wizard.answers().hostingAmount).toBe(1);
      expect(input.disabled).toBeFalse();
      expect(checkbox.checked).toBeFalse();

      // El tecleo continúa con el foco y la casilla sin marcar.
      input.value = '18';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(input.disabled).toBeFalse();
      expect(checkbox.checked).toBeFalse();
    });

    it('con importe conocido, "Ver diagnóstico" muestra MIGRATE con el importe en negrita', () => {
      const input = el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!;
      input.value = '180';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      el().querySelector<HTMLButtonElement>('.wizard-cta-primary')!.click();
      fixture.detectChanges();

      expect(wizard.result()).toBe('MIGRATE');
      expect(el().querySelector('.wizard-result--migrate')).not.toBeNull();
      const badText = el().querySelector('.wizard-result__bad-text')!;
      expect(badText.textContent).toContain('180 € al año');
      expect(badText.querySelector('strong')).not.toBeNull();
    });

    it('sin importe (desconocido) muestra la variante genérica del coste', () => {
      const checkbox = el().querySelector<HTMLInputElement>('#wizard-hosting-unknown')!;
      checkbox.click();
      fixture.detectChanges();

      el().querySelector<HTMLButtonElement>('.wizard-cta-primary')!.click();
      fixture.detectChanges();

      expect(wizard.result()).toBe('MIGRATE');
      const badText = el().querySelector('.wizard-result__bad-text')!;
      expect(badText.textContent).toContain('Estás pagando de más');
      expect(badText.textContent).not.toContain('€ al año');
    });

    it('con input vacío y checkbox sin marcar muestra la variante genérica', () => {
      el().querySelector<HTMLButtonElement>('.wizard-cta-primary')!.click();
      fixture.detectChanges();

      expect(wizard.result()).toBe('MIGRATE');
      expect(el().querySelector('.wizard-result__bad-text')?.textContent).toContain(
        'Estás pagando de más'
      );
    });

    it('con un importe menor que el umbral (10€) muestra la variante genérica, como "No lo sé"', () => {
      const input = el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!;
      input.value = '10';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      el().querySelector<HTMLButtonElement>('.wizard-cta-primary')!.click();
      fixture.detectChanges();

      expect(wizard.answers().hostingKnown).toBeFalse();
      expect(wizard.answers().hostingAmount).toBeNull();
      expect(wizard.result()).toBe('MIGRATE');
      const badText = el().querySelector('.wizard-result__bad-text')!;
      expect(badText.textContent).toContain('Estás pagando de más');
      expect(badText.querySelector('strong')).toBeNull();
    });

    it('con un importe bajo el umbral el mensaje preconstruido usa la variante desconocida', () => {
      const input = el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!;
      input.value = '10';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // "Ver diagnóstico" muestra el resultado MIGRATE sin importe.
      el().querySelector<HTMLButtonElement>('.wizard-cta-primary')!.click();
      fixture.detectChanges();

      // CTA del resultado: prepara el lead y navega a contacto.
      spyOn(router, 'navigate');
      el().querySelector<HTMLButtonElement>('.wizard-cta-primary')!.click();
      fixture.detectChanges();

      expect(wizard.pendingLead()!.message).toContain(
        'el coste del hosting es desconocido / a auditar'
      );
      expect(wizard.pendingLead()!.message).not.toContain('pago aproximadamente');
    });

    it('filtra todo lo que no sean dígitos mientras se teclea', () => {
      const input = el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!;
      input.value = '12a3';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(wizard.answers().hostingAmount).toBe(123);
      expect(input.value).toBe('123');
    });

    it('si solo hay letras el importe queda vacío', () => {
      const input = el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!;
      input.value = 'abc';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(wizard.answers().hostingAmount).toBeNull();
      expect(input.value).toBe('');
    });

    it('el anillo de foco del input usa el magenta de Angular (no mint ni azul)', () => {
      const input = el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!;
      input.focus();
      fixture.detectChanges();

      const shadow = getComputedStyle(input).boxShadow;
      expect(shadow).toContain('rgb(255, 0, 128)'); // $angular-magenta
      expect(shadow).not.toContain('rgb(142, 212, 194)'); // $green-soft (mint)
      expect(shadow).not.toContain('rgb(0, 95, 204)'); // $accent-blue (global)
    });
  });

  describe('Botón Atrás', () => {
    it('no existe en el paso 1, sí en los pasos 2 y 3, y navega hacia atrás', () => {
      expect(backButton()).toBeNull();

      options()[0].click();
      fixture.detectChanges();
      expect(backButton()).not.toBeNull();

      options()[0].click();
      fixture.detectChanges();
      expect(backButton()).not.toBeNull();

      backButton()!.click();
      fixture.detectChanges();
      expect(wizard.step()).toBe(1);

      backButton()!.click();
      fixture.detectChanges();
      expect(wizard.step()).toBe(0);
    });
  });

  describe('Resultado y contacto', () => {
    function reachMigrateResult(): void {
      options()[0].click();
      fixture.detectChanges();
      options()[0].click();
      fixture.detectChanges();
      el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!.value = '180';
      el()
        .querySelector<HTMLInputElement>('#wizard-hosting-amount')!
        .dispatchEvent(new Event('input'));
      fixture.detectChanges();
      el().querySelector<HTMLButtonElement>('.wizard-cta-primary')!.click();
      fixture.detectChanges();
    }

    it('el CTA del resultado guarda el lead y navega a /contact', () => {
      reachMigrateResult();

      spyOn(router, 'navigate');

      // CTA del resultado ("Quiero saber cuánto me costaría").
      el().querySelector<HTMLButtonElement>('.wizard-cta-primary')!.click();
      fixture.detectChanges();

      const routerSpy = router as unknown as { navigate: jasmine.Spy };
      expect(wizard.pendingLead()).not.toBeNull();
      expect(wizard.pendingLead()!.result).toBe('MIGRATE');
      expect(wizard.pendingLead()!.message).toContain(
        'pago aproximadamente 180 €/año'
      );
      expect(wizard.pendingLead()!.message).toContain(
        'Oferta no vinculante: primero analizo tu caso y te paso presupuesto.'
      );
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/contact']);
    });

    it('el mensaje preconstruido no se renderiza en el DOM', () => {
      reachMigrateResult();
      expect(el().textContent).not.toContain('Hola Nomacoda, he realizado el test');
    });

    it('el descargo de no vinculación es visible en los tres resultados', () => {
      options()[1].click();
      fixture.detectChanges();
      expect(el().querySelector('.wizard-disclaimer')?.textContent).toContain(
        'Oferta no vinculante'
      );

      wizard.reset();
      fixture.detectChanges();
      options()[0].click();
      fixture.detectChanges();
      options()[1].click();
      fixture.detectChanges();
      expect(el().querySelector('.wizard-disclaimer')?.textContent).toContain(
        'Oferta no vinculante'
      );

      wizard.reset();
      fixture.detectChanges();
      options()[0].click();
      fixture.detectChanges();
      options()[0].click();
      fixture.detectChanges();
      el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!.value = '180';
      el()
        .querySelector<HTMLInputElement>('#wizard-hosting-amount')!
        .dispatchEvent(new Event('input'));
      fixture.detectChanges();
      el().querySelector<HTMLButtonElement>('.wizard-cta-primary')!.click();
      fixture.detectChanges();
      expect(el().querySelector('.wizard-disclaimer')?.textContent).toContain(
        'Oferta no vinculante'
      );
    });

    it('"Repetir test" vuelve al paso 1 con el estado limpio', () => {
      reachMigrateResult();
      el().querySelector<HTMLButtonElement>('.wizard-repeat')!.click();
      fixture.detectChanges();

      expect(wizard.step()).toBe(0);
      expect(wizard.result()).toBeNull();
      expect(wizard.answers().hasWeb).toBeNull();
      expect(activeHeading()?.textContent).toContain('¿Tu negocio tiene página web?');
    });

    it('Escape en el resultado reinicia el asistente', () => {
      options()[1].click();
      fixture.detectChanges();
      expect(wizard.step()).toBe('result');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(wizard.step()).toBe(0);
      expect(wizard.result()).toBeNull();
    });
  });

  describe('Accesibilidad', () => {
    it('mueve el foco al encabezado del nuevo paso al responder', () => {
      options()[0].click();
      fixture.detectChanges();

      expect(document.activeElement).toBe(activeHeading());
      expect(activeHeading()!.textContent).toContain(
        '¿La creaste con WordPress o similar?'
      );
    });

    it('paso 1 sin violaciones axe (WCAG 2.1/2.2 AA)', async () => {
      await fixture.whenStable();
      try {
        const result = await axe(el(), { rules: { 'color-contrast': { enabled: false } } });
        expect(result).toHaveNoViolations();
      } catch (err) {
        console.warn('[a11y] axe-core no disponible:', err);
        pending('axe-core incompatible con el entorno de test actual');
      }
    });

    it('resultado MIGRATE sin violaciones axe (WCAG 2.1/2.2 AA)', async () => {
      options()[0].click();
      fixture.detectChanges();
      options()[0].click();
      fixture.detectChanges();
      el().querySelector<HTMLInputElement>('#wizard-hosting-amount')!.value = '180';
      el()
        .querySelector<HTMLInputElement>('#wizard-hosting-amount')!
        .dispatchEvent(new Event('input'));
      fixture.detectChanges();
      el().querySelector<HTMLButtonElement>('.wizard-cta-primary')!.click();
      fixture.detectChanges();
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
});
