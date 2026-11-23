import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { TutoringServiceComponent } from './tutoring-service.component';
import { TutoringTerminalService } from '../tutoring-terminal.service';

/**
 * Diccionario mínimo (es-ES) de las claves que el componente traduce.
 * Espejo de src/assets/i18n/es-ES.json bajo TUTORING.TERMINAL (Task 7 añade
 * el flujo interactivo; aquí solo el chrome del IDE).
 */
const mockTranslations = {
  ROUTE: { TUTORING: 'Tutorías' },
  TUTORING: {
    TERMINAL: {
      BREADCRUMB: {
        WS: 'workspace',
        DIR: 'mentorship',
        FILE: 'tutorias-daw-dam.sh'
      },
      SIDEBAR: {
        EXPLORER: 'Explorador',
        GROUP: 'NOMACODA-HUB',
        FILE_TUTORING: 'tutorías.md',
        FILE_CONTACT: 'contacto.md',
        BADGE_ACTIVE: 'active',
        STATS_TITLE: 'TUTORÍA STATS',
        STATS_FCT_LABEL: 'Aprobados FCT:',
        STATS_FCT_VALUE: '100%',
        STATS_FORMAT_LABEL: 'Formato:',
        STATS_FORMAT_VALUE: '1 to 1 Discord',
        STATS_LIVE_LABEL: 'Live Coding:',
        STATS_LIVE_VALUE: 'VS Code Share',
        CHANNEL_TITLE: 'Canal Discord Privado',
        CHANNEL_SUBTITLE: '● Resolución diaria de dudas'
      },
      TABS: {
        TERMINAL: 'terminal: solicitar_tutoria.sh',
        BADGE_RUNNING: 'running',
        README: 'README.md',
        CONF: 'discord-channel.conf'
      },
      TOPBAR: {
        ENGINE: 'zsh - nomacoda@cli-engine v2.6.4 (interactive-pty)'
      },
      STATUSBAR: {
        BRANCH: 'master*',
        ERRORS: '0 errors, 0 warnings',
        LANG: 'TypeScript / Shell'
      },
      BANNER: { TITLE: 'banner', DESCRIPTION: 'desc', HINT: 'hint' },
      BOOT: {
        CHECK_MODULES: 'check modules',
        CHECK_CHANNEL: 'check channel',
        START: 'start'
      },
      QUESTIONS: {
        CYCLE: '¿Ciclo?',
        CYCLE_HINT: '(DAW / DAM)',
        YEAR: '¿Año?',
        YEAR_HINT: '(1º / 2º)',
        SUBJECTS: '¿Asignaturas?',
        SUBJECTS_HINT: '(números)',
        HOURS: '¿Horas?',
        HOURS_HINT: '(ej: 4)',
        CONFIRM: '¿CONTACTAR?',
        CLEAR_HINT_END: '- Limpia la consola '
      },
      ERRORS: { CYCLE: 'e1', YEAR: 'e2', SUBJECTS: 'e3', HOURS: 'e5', CONFIRM: 'e4' },
      ECHO: {
        CYCLE: 'Ciclo:',
        YEAR: 'Curso:',
        SUBJECTS: 'Asignaturas:',
        HOURS: 'Horas semanales:'
      },
      SUMMARY: {
        BUILDING: 'building',
        BUILD_OK: 'build ok',
        SOCKET_OK: 'socket ok',
        DISPATCH: 'dispatch ok',
        SENT_LABEL: 'Solicitud enviada'
      },
      MESSAGE: {
        WITH_PROJECT: 'PROYECTO_MSG',
        DISCLAIMER: 'DISCLAIMER_TEXT'
      },
      SUBJECTS: {
        FCT: 'SUBJ1',
        PROGRAMMING: 'SUBJ2',
        DATABASES: 'SUBJ3',
        SYSTEMS: 'SUBJ4',
        MARKUP_LANGUAGES: 'SUBJ5',
        DEV_ENVIRONMENTS: 'SUBJ6x',
        DATA_ACCESS: 'SUBJ7',
        INTERFACES: 'SUBJ8',
        MOBILE: 'SUBJ9',
        PROCESSES: 'SUBJ10',
        ERP_SGE: 'SUBJ11',
        WEB_CLIENT: 'SUBJ12',
        WEB_SERVER: 'SUBJ13',
        DEPLOYMENT: 'SUBJ14'
      }
    }
  }
};

const mockLoader = { getTranslation: () => of(mockTranslations) };

describe('TutoringServiceComponent — layout IDE', () => {
  let fixture: ComponentFixture<TutoringServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TutoringServiceComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    // El componente traduce con el pipe: el idioma debe estar cargado antes
    // del primer detección de cambios (patrón del spec del wizard).
    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));

    fixture = TestBed.createComponent(TutoringServiceComponent);
    fixture.detectChanges();
    // El motor de tecleo arranca al crear el servicio: los tests de layout
    // y flujo necesitan el log completo (el efecto typewriter tiene su
    // propio describe con reloj simulado).
    TestBed.inject(TutoringTerminalService).flushTyping();
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  function el(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('renderiza el h1 accesible de la página y mantiene el fondo por defecto', () => {
    const section = el().querySelector('section.tutoring');
    expect(section).toBeTruthy();
    const title = el().querySelector('#tutoring-title');
    expect(title?.textContent?.trim()).toBe('Tutorías');
  });

  it('renderiza el breadcrumb con la ruta del proyecto y el fichero activo', () => {
    const breadcrumb = el().querySelector('.tutoring-breadcrumb');
    expect(breadcrumb?.textContent).toContain('workspace');
    expect(breadcrumb?.textContent).toContain('mentorship');
    expect(breadcrumb?.textContent).toContain('tutorias-daw-dam.sh');
  });

  it('la ventana IDE existe y contiene sidebar y área terminal', () => {
    expect(el().querySelector('.tutoring-window')).toBeTruthy();
    expect(el().querySelector('.tutoring-sidebar')).toBeTruthy();
    expect(el().querySelector('.tutoring-main')).toBeTruthy();
    // El interior interactivo del terminal se rellena en Task 7.
    expect(el().querySelector('.tutoring-terminal')).toBeTruthy();
  });

  it('el sidebar lista los 2 archivos con sus rutas reales y el activo', () => {
    const hrefs = Array.from(el().querySelectorAll('.tutoring-files a')).map(
      (a) => a.getAttribute('href')
    );
    expect(hrefs).toEqual(['/tutoring', '/contact']);

    const active = el().querySelector('.tutoring-files__link.is-active');
    expect(active?.textContent).toContain('tutorías.md');
  });

  it('muestra la caja de stats y el badge del canal Discord', () => {
    const stats = el().querySelector('.tutoring-stats');
    expect(stats?.textContent).toContain('TUTORÍA STATS');
    expect(stats?.textContent).toContain('100%');
    expect(stats?.textContent).toContain('1 to 1 Discord');
    expect(stats?.textContent).toContain('VS Code Share');

    const channel = el().querySelector('.tutoring-channel');
    expect(channel?.textContent).toContain('Canal Discord Privado');
  });

  it('renderiza las 3 tabs del editor y la topbar del motor', () => {
    const tabs = el().querySelectorAll('.tutoring-tab');
    expect(tabs.length).toBe(3);
    expect(tabs[0]?.classList.contains('is-active')).toBeTrue();

    const topbar = el().querySelector('.tutoring-topbar');
    expect(topbar?.textContent).toContain(
      'zsh - nomacoda@cli-engine v2.6.4 (interactive-pty)'
    );
    // El reinicio ya no es un botón: es el comando `clear` del terminal.
    expect(el().querySelector('button.tutoring-restart')).toBeNull();
  });

  it('renderiza la barra de estado con rama, errores y lenguaje', () => {
    const status = el().querySelector('.tutoring-status');
    expect(status?.textContent).toContain('master*');
    expect(status?.textContent).toContain('0 errors, 0 warnings');
    expect(status?.textContent).toContain('TypeScript / Shell');
  });

  // ---------- Terminal interactivo (Task 7) ----------

  function inputEl(): HTMLInputElement {
    return el().querySelector('.tutoring-terminal__input') as HTMLInputElement;
  }

  function lineCount(): number {
    return el().querySelectorAll('[data-terminal-line]').length;
  }

  function typeAnswer(value: string): void {
    const input = inputEl();
    input.value = value;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    // El submit hace flush del motor de tecleo: el log queda completo y
    // determinista para las aserciones siguientes.
    TestBed.inject(TutoringTerminalService).flushTyping();
    fixture.detectChanges();
  }

  it('arranque: banner <pre>, boot, región log viva y pregunta activa en el CLI', () => {
    expect(el().querySelector('pre.tutoring-terminal__pre')).toBeTruthy();
    const log = el().querySelector('.tutoring-terminal__log');
    expect(log?.getAttribute('aria-live')).toBe('polite');
    expect(el().querySelectorAll('[data-terminal-line]').length).toBeGreaterThan(4);
    expect(inputEl().getAttribute('aria-label')).toContain('¿Ciclo?');
    // El "cursor" del terminal es el caret nativo del input, en verde Discord.
    const inputStyle = getComputedStyle(inputEl());
    expect(inputStyle.caretColor).toBe('rgb(87, 242, 135)');
  });

  it('flujo E2E tecleado: daw → 2 → 1,3 → 4 termina en la pregunta de envío (Y/N)', () => {
    typeAnswer('daw');
    expect(inputEl().getAttribute('aria-label')).toContain('¿Año?');

    typeAnswer('2');
    // 2º DAW: lista de 4 con FCT primera y destacada (color/estilo distintos).
    expect(el().querySelectorAll('[data-line-kind="options"]').length).toBe(4);
    const firstOption = el().querySelector('[data-line-kind="options"]');
    expect(firstOption?.classList.contains('is-highlighted')).toBeTrue();
    expect(firstOption?.textContent).toContain('SUBJ1');

    typeAnswer('1,3');
    expect(inputEl().getAttribute('aria-label')).toContain('¿Horas?');

    typeAnswer('4');
    // Sin bloque de payload visible (como n8n): el mensaje viaja oculto en el
    // lead. El final es una pregunta más del terminal, sin botones.
    expect(el().querySelector('.tutoring-terminal__log')?.textContent).not.toContain('PROYECTO_MSG');
    expect(el().querySelector('.tutoring-cta')).toBeNull();
    const last = el().querySelectorAll('[data-terminal-line]').length;
    const lastLine = el().querySelectorAll('[data-terminal-line]')[last - 1];
    expect(lastLine?.getAttribute('data-line-kind')).toBe('question');
    expect(lastLine?.textContent).toContain('¿CONTACTAR?');
    // El input sigue en el CLI con la pregunta de confirmación.
    expect(inputEl().getAttribute('aria-label')).toContain('¿CONTACTAR?');
  });

  it('1º comparte troncal: la lista de asignaturas pasa de 5 sin destacada', () => {
    typeAnswer('dam');
    typeAnswer('1');
    const options = el().querySelectorAll('[data-line-kind="options"]');
    expect(options.length).toBe(5);
    // Sin FCT en 1º: ninguna línea destacada.
    expect(el().querySelector('[data-line-kind="options"].is-highlighted')).toBeNull();
  });

  it('2º DAM: la lista pasa a 6 opciones con FCT primera', () => {
    typeAnswer('dam');
    typeAnswer('2');
    const options = el().querySelectorAll('[data-line-kind="options"]');
    expect(options.length).toBe(6);
    expect(options[0]?.classList.contains('is-highlighted')).toBeTrue();
    expect(options[0]?.textContent).toContain('SUBJ1');
  });

  it('entrada inválida: línea de error y la pregunta se repite', () => {
    typeAnswer('dfk');
    expect(el().querySelector('[data-line-kind="error"]')?.textContent).toContain('e1');
    expect(inputEl().getAttribute('aria-label')).toContain('¿Ciclo?');
    expect(el().querySelectorAll('[data-line-kind="question"]').length).toBe(2);
  });

  it('horas no numéricas: error y re-pregunta (solo números)', () => {
    typeAnswer('daw');
    typeAnswer('2');
    typeAnswer('1,3');
    typeAnswer('abc');
    expect(el().querySelector('[data-line-kind="error"]')?.textContent).toContain('e5');
    expect(inputEl().getAttribute('aria-label')).toContain('¿Horas?');
  });

  it('Enter vacío no añade líneas ni cambia el paso', () => {
    const before = lineCount();
    typeAnswer('');
    expect(lineCount()).toBe(before);
    expect(inputEl().getAttribute('aria-label')).toContain('¿Ciclo?');
  });

  it('el foco permanece en el input del CLI tras cada respuesta', () => {
    typeAnswer('daw');
    expect(document.activeElement).toBe(inputEl());
  });

  it("responder 'y' a la pregunta final prepara el lead y navega a /contact", () => {
    typeAnswer('daw');
    typeAnswer('2');
    typeAnswer('1,3');
    typeAnswer('4');

    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    typeAnswer('y');

    expect(navigateSpy).toHaveBeenCalledWith(['/contact']);
  });

  it("responder 'n' a la pregunta final reinicia el terminal", () => {
    typeAnswer('daw');
    typeAnswer('2');
    typeAnswer('1,3');
    typeAnswer('4');
    typeAnswer('n');

    expect(inputEl().getAttribute('aria-label')).toContain('¿Ciclo?');
    const firstLine = el().querySelector('[data-terminal-line]');
    expect(firstLine?.getAttribute('data-line-kind')).toBe('banner');
  });

  it('al completar el cuestionario el foco permanece en el input (pregunta de envío)', () => {
    typeAnswer('daw');
    typeAnswer('2');
    typeAnswer('1,3');
    typeAnswer('4');

    expect(document.activeElement).toBe(inputEl());
    expect(inputEl().getAttribute('aria-label')).toContain('¿CONTACTAR?');
  });

  it("teclear 'clear' en cualquier paso reinicia el terminal", () => {
    typeAnswer('daw');
    typeAnswer('2');

    typeAnswer('CLEAR');
    fixture.detectChanges();

    expect(inputEl()).toBeTruthy();
    expect(inputEl().getAttribute('aria-label')).toContain('¿Ciclo?');
    const firstLine = el().querySelector('[data-terminal-line]');
    expect(firstLine?.getAttribute('data-line-kind')).toBe('banner');
    // Log inicial completo: banner + 3 system + comando + 2 boot + start + pregunta.
    expect(lineCount()).toBe(9);
  });

  it('el aviso de clear es chrome fijo bajo el CLI (fuera del log, siempre visible)', () => {
    const hint = el().querySelector('.tutoring-terminal__hint');
    expect(hint).toBeTruthy();
    // Hermano del log: NO está dentro del área scrolleable.
    expect(hint?.closest('.tutoring-terminal__log')).toBeNull();
    expect(hint?.textContent).toContain('clear');
    expect(hint?.textContent).toContain('- Limpia la consola');
    // La palabra clear va en tono accent (blurple).
    const word = hint?.querySelector('.tutoring-terminal__part--accent');
    expect(word?.textContent).toBe('clear');
    // Sigue presente tras varias respuestas (es chrome, no mensaje).
    typeAnswer('daw');
    fixture.detectChanges();
    expect(el().querySelector('.tutoring-terminal__hint')).toBeTruthy();
  });

  // ---------- Autoscroll pegajoso (2026-11-23) ----------
  // El terminal es el ÚNICO scroll de la página. El componente clava el
  // scroll abajo mientras el usuario esté al fondo, deja de empujar si sube
  // a leer y re-clava al responder (o al volver abajo por su cuenta).

  describe('autoscroll pegajoso', () => {
    // Geometría determinista: el flex:1 del stylesheet depende del viewport
    // del navegador de tests. Lo que se testea es la lógica de scroll del
    // componente, no el CSS del contenedor.
    const TERMINAL_HEIGHT = '120px';

    function terminalBody(): HTMLElement {
      return el().querySelector('.tutoring-terminal') as HTMLElement;
    }

    /** Distancia del cursor al fondo del contenedor (0 = clavado abajo). */
    function distanceToBottom(body: HTMLElement): number {
      return body.scrollHeight - body.scrollTop - body.clientHeight;
    }

    /** Clavado abajo con tolerancia sub-píxel (zoom/redondeo del navegador). */
    function atBottom(body: HTMLElement): boolean {
      return Math.abs(distanceToBottom(body)) < 1;
    }

    // Async: espera las fuentes antes de medir (ver nota de scrollableTerminal
    // en el describe del typewriter: un reflow de @font-face descoloca snaps).
    beforeEach(async () => {
      const body = terminalBody();
      body.style.flex = `0 0 ${TERMINAL_HEIGHT}`;
      body.style.height = TERMINAL_HEIGHT;
      body.style.overflowY = 'auto';
      // El scroll necesita layout real: el fixture se cuelga del documento
      // (el afterEach lo retira antes del destroy del fixture).
      document.body.appendChild(el());
      void body.scrollHeight; // fuerza layout: encola la carga del @font-face
      await document.fonts.ready;
    });

    afterEach(() => el().remove());

    it('pegado abajo: cada respuesta mantiene el scroll al fondo', () => {
      typeAnswer('daw');
      const body = terminalBody();
      expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
      expect(atBottom(body)).toBeTrue();
    });

    it('responder con el scroll arriba re-clava al fondo', () => {
      typeAnswer('daw');
      const body = terminalBody();
      body.scrollTop = 0;
      body.dispatchEvent(new Event('scroll'));

      typeAnswer('2');
      expect(atBottom(body)).toBeTrue();
    });

    it("'clear' reinicia y re-clava el scroll abajo", () => {
      typeAnswer('daw');
      const body = terminalBody();
      body.scrollTop = 0;
      body.dispatchEvent(new Event('scroll'));

      typeAnswer('clear');
      expect(atBottom(body)).toBeTrue();
    });
  });
});

/**
 * Efecto typewriter en el DOM (2026-11-21): reloj simulado y fixture propio.
 * El TestBed del describe anterior ya habría hecho flush del servicio, así
 * que este describe reinicia la sesión con su propio arranque de motor.
 */
describe('TutoringServiceComponent — efecto typewriter', () => {
  let fixture: ComponentFixture<TutoringServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TutoringServiceComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));

    jasmine.clock().install();
    // Nueva sesión con el reloj parado: cursor del motor a 0.
    TestBed.inject(TutoringTerminalService).restart();
    fixture = TestBed.createComponent(TutoringServiceComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    fixture.nativeElement.remove();
    fixture.destroy();
  });

  function shownLines(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[data-terminal-line]')
    );
  }

  // ---------- Autoscroll pegajoso durante el tecleo (2026-11-23) ----------

  /**
   * Contenedor scrolleable de altura fija, colgado del documento, con las
   * fuentes ya cargadas: el primer fixture que se cuelga en el run dispara
   * la carga async del @font-face del mono y un reflow posterior descolocaría
   * el snap medido (flaky con el orden aleatorio de Jasmine).
   */
  async function scrollableTerminal(): Promise<HTMLElement> {
    const body = (fixture.nativeElement as HTMLElement).querySelector(
      '.tutoring-terminal'
    ) as HTMLElement;
    body.style.flex = '0 0 120px';
    body.style.height = '120px';
    body.style.overflowY = 'auto';
    document.body.appendChild(fixture.nativeElement as HTMLElement);
    void body.scrollHeight; // fuerza layout: encola la carga del @font-face
    await document.fonts.ready;
    return body;
  }

  /** Distancia del cursor al fondo del contenedor (0 = clavado abajo). */
  function distanceToBottom(body: HTMLElement): number {
    return body.scrollHeight - body.scrollTop - body.clientHeight;
  }

  /** Clavado abajo con tolerancia sub-píxel (zoom/redondeo del navegador). */
  function atBottom(body: HTMLElement): boolean {
    return Math.abs(distanceToBottom(body)) < 1;
  }

  it('al arrancar solo el banner está en el DOM y el log anuncia aria-busy', () => {
    expect(shownLines().length).toBe(1);
    const log = fixture.nativeElement.querySelector('.tutoring-terminal__log');
    expect(log?.getAttribute('aria-busy')).toBe('true');
    // El hint de clear (chrome) sí está completo desde el primer frame.
    expect(
      fixture.nativeElement.querySelector('.tutoring-terminal__hint')
    ).toBeTruthy();
  });

  it('con el tiempo aparecen más líneas y aria-busy pasa a false al terminar', () => {
    jasmine.clock().tick(6000);
    fixture.detectChanges();
    expect(shownLines().length).toBe(9);
    const log = fixture.nativeElement.querySelector('.tutoring-terminal__log');
    expect(log?.getAttribute('aria-busy')).toBe('false');
  });

  it('la línea en curso lleva el caret de tecleo (is-typing)', () => {
    jasmine.clock().tick(1000);
    fixture.detectChanges();
    const typing = fixture.nativeElement.querySelector(
      '.tutoring-terminal__line.is-typing'
    );
    expect(typing).toBeTruthy();
  });

  it("el salto a /contact es diferido: no navega hasta terminar de escribir el dispatch", () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    const type = (value: string): void => {
      const input = fixture.nativeElement.querySelector(
        '.tutoring-terminal__input'
      ) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      // Sin flush: el dispatch debe teclearse antes de navegar.
      fixture.detectChanges();
    };

    type('daw');
    type('2');
    type('1');
    type('6');
    type('y');

    // En CONFIRM→SENT el componente aplaza la navegación mientras teclea.
    expect(navigateSpy).not.toHaveBeenCalled();

    jasmine.clock().tick(6000);
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['/contact']);
  });

  it('subido arriba: el tecleo no arrastra el scroll hacia abajo', async () => {
    const body = await scrollableTerminal();

    jasmine.clock().tick(1000);
    fixture.detectChanges();
    const linesBefore = shownLines().length;
    expect(linesBefore).toBeGreaterThan(1);
    expect(atBottom(body)).toBeTrue();

    // El usuario sube a leer: el scroll desactiva el seguimiento.
    body.scrollTop = 0;
    body.dispatchEvent(new Event('scroll'));

    jasmine.clock().tick(1000);
    fixture.detectChanges(); // siguen llegando líneas… sin yank
    expect(shownLines().length).toBeGreaterThan(linesBefore);
    expect(body.scrollTop).toBe(0);
  });

  it('volver al fondo reanuda el seguimiento del log', async () => {
    const body = await scrollableTerminal();

    jasmine.clock().tick(1000);
    fixture.detectChanges();

    body.scrollTop = 0;
    body.dispatchEvent(new Event('scroll'));
    jasmine.clock().tick(1000);
    fixture.detectChanges();
    expect(body.scrollTop).toBe(0); // leyendo arriba: sin empuje

    // El usuario vuelve al fondo por su cuenta: el seguimiento se reactiva.
    body.scrollTop = body.scrollHeight - body.clientHeight;
    body.dispatchEvent(new Event('scroll'));
    jasmine.clock().tick(1000);
    fixture.detectChanges();
    expect(atBottom(body)).toBeTrue();
  });
});
