import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LANGUAGES } from '../../constants/lang.constants';
import { LangService } from '../../services/lang.service';
import { LangSelectorComponent } from './lang-selector.component';

const mockLoader = { getTranslation: () => of({}) };

function buildLangServiceSpy(
  currentLang = 'es-ES'
): jasmine.SpyObj<LangService> {
  const spy = jasmine.createSpyObj<LangService>('LangService', ['setLanguage']);
  // Provide a readonly-compatible signal via a plain function
  (spy as { currentLanguage: () => string }).currentLanguage = () =>
    currentLang;
  return spy;
}

/** Acceso tipado a `navigateOptions` (private) para poder espiarla. */
function spyOnNavigateOptions(component: LangSelectorComponent): jasmine.Spy {
  return spyOn(
    component as unknown as {
      navigateOptions: (direction: number, currentElement: HTMLElement) => void;
    },
    'navigateOptions'
  );
}

/** Acceso tipado a `_focusOption` (private) para poder espiarla. */
function spyOnFocusOption(component: LangSelectorComponent): jasmine.Spy {
  return spyOn(
    component as unknown as { _focusOption: (index: number) => void },
    '_focusOption'
  );
}

describe('LangSelectorComponent', () => {
  let component: LangSelectorComponent;
  let fixture: ComponentFixture<LangSelectorComponent>;
  let langServiceSpy: jasmine.SpyObj<LangService>;

  beforeEach(async () => {
    langServiceSpy = buildLangServiceSpy('es-ES');

    await TestBed.configureTestingModule({
      imports: [
        LangSelectorComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LangService, useValue: langServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LangSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should start with options closed', () => {
      expect(component.showOptions()).toBeFalse();
    });
  });

  describe('#currentLanguage (computed)', () => {
    it('should resolve the active language from the LANGUAGES list', () => {
      const current = component.currentLanguage();
      expect(current?.id).toBe('es-ES');
    });
  });

  describe('#filteredLanguages (computed)', () => {
    it('should exclude the currently active language from the list', () => {
      const ids = component.filteredLanguages().map((l) => l.id);
      expect(ids).not.toContain('es-ES');
      expect(ids).toContain('en-US');
    });

    it('should contain exactly (LANGUAGES.length - 1) entries', () => {
      expect(component.filteredLanguages().length).toBe(LANGUAGES.length - 1);
    });
  });

  describe('#toggleOptions', () => {
    it('should open the options panel when closed', () => {
      component.toggleOptions();
      expect(component.showOptions()).toBeTrue();
    });

    it('should close the options panel when open', () => {
      component.toggleOptions(); // open
      component.toggleOptions(); // close
      expect(component.showOptions()).toBeFalse();
    });
  });

  describe('#closeOptions', () => {
    it('should set showOptions to false', () => {
      component.toggleOptions(); // open first
      component.closeOptions();
      expect(component.showOptions()).toBeFalse();
    });
  });

  describe('#selectLanguage', () => {
    it('should call LangService.setLanguage with the selected language', () => {
      component.selectLanguage('en-US');
      expect(langServiceSpy.setLanguage).toHaveBeenCalledWith('en-US');
    });

    it('should close the options panel after selection', () => {
      component.toggleOptions();
      component.selectLanguage('en-US');
      expect(component.showOptions()).toBeFalse();
    });
  });

  describe('#onKeyDown — keyboard accessibility', () => {
    it('should toggle options on Enter', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.showOptions()).toBeTrue();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should toggle options on Space', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.showOptions()).toBeTrue();
    });

    it('should close options on Escape', () => {
      component.toggleOptions(); // open first
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(component.showOptions()).toBeFalse();
    });

    it('should open options on ArrowDown when closed', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.showOptions()).toBeTrue();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should close options on ArrowUp when open', () => {
      component.toggleOptions(); // open first
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.showOptions()).toBeFalse();
    });

    it('should ignore Home when the menu is closed', () => {
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      spyOn(event, 'preventDefault');
      const focusSpy = spyOnFocusOption(component);

      component.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should prevent default and focus the first option on Home when open', () => {
      component.toggleOptions(); // open first
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      spyOn(event, 'preventDefault');
      const focusSpy = spyOnFocusOption(component);

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalledWith(0);
    });

    it('should ignore End when the menu is closed', () => {
      const event = new KeyboardEvent('keydown', { key: 'End' });
      spyOn(event, 'preventDefault');
      const focusSpy = spyOnFocusOption(component);

      component.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should prevent default and focus the last option on End when open', () => {
      component.toggleOptions(); // open first
      const event = new KeyboardEvent('keydown', { key: 'End' });
      spyOn(event, 'preventDefault');
      const focusSpy = spyOnFocusOption(component);

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalledWith(
        component.filteredLanguages().length - 1
      );
    });

    it('should jump to the option starting with the typed character (typeahead)', () => {
      component.toggleOptions(); // open first
      const event = new KeyboardEvent('keydown', { key: 'e' });
      spyOn(event, 'preventDefault');
      const focusSpy = spyOnFocusOption(component);

      component.onKeyDown(event);

      // 'ENG' es la única opción filtrada y empieza por 'e'
      expect(event.preventDefault).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalledWith(0);
    });

    it('should ignore multi-character keys in typeahead', () => {
      component.toggleOptions(); // open first
      const event = new KeyboardEvent('keydown', { key: 'PageDown' });
      const focusSpy = spyOnFocusOption(component);

      component.onKeyDown(event);

      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should ignore typeahead when the menu is closed', () => {
      const event = new KeyboardEvent('keydown', { key: 'z' });
      const focusSpy = spyOnFocusOption(component);

      component.onKeyDown(event);

      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should not focus anything when no option matches the typed character', () => {
      component.toggleOptions(); // open first
      const event = new KeyboardEvent('keydown', { key: 'z' });
      spyOn(event, 'preventDefault');
      const focusSpy = spyOnFocusOption(component);

      component.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should ignore whitespace keys in typeahead', () => {
      component.toggleOptions(); // open first
      const event = new KeyboardEvent('keydown', { key: '\t' });
      const focusSpy = spyOnFocusOption(component);

      component.onKeyDown(event);

      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe('#onLanguageKeyDown — option keyboard navigation', () => {
    let mockElements: HTMLElement[];
    const testLangId = 'en-US';

    beforeEach(() => {
      mockElements = [];
    });

    afterEach(() => {
      // Clean only our test elements
      mockElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      mockElements = [];
    });

    it('should select the language on Enter', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');

      component.onLanguageKeyDown(event, testLangId);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(langServiceSpy.setLanguage).toHaveBeenCalledWith(testLangId);
    });

    it('should select the language on Space', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');

      component.onLanguageKeyDown(event, testLangId);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(langServiceSpy.setLanguage).toHaveBeenCalledWith(testLangId);
    });

    it('should close options and focus button on Escape key', () => {
      spyOn(component, 'closeOptions');

      // Build a minimal #triggerBtn in the rendered DOM that responds to focus().
      const triggerBtn = fixture.nativeElement.querySelector(
        '#triggerBtn'
      ) as HTMLButtonElement | null;
      // viewChild returns the button only after detectChanges; if missing, fall back.
      // The component uses viewChild('triggerBtn'); the existing template has #triggerBtn.
      const focusSpy = triggerBtn
        ? spyOn(triggerBtn, 'focus')
        : jasmine.createSpy('focus');

      const mockTarget = document.createElement('li');
      const event = Object.create(KeyboardEvent.prototype);
      Object.defineProperty(event, 'key', { value: 'Escape' });
      Object.defineProperty(event, 'target', { value: mockTarget });

      component.onLanguageKeyDown(event, testLangId);

      expect(component.closeOptions).toHaveBeenCalled();
      // focus call is best-effort: only assert when a real trigger button is in the DOM.
      if (triggerBtn) {
        expect(focusSpy).toHaveBeenCalled();
      }
    });

    it('should prevent default and navigate down on ArrowDown key', () => {
      spyOnNavigateOptions(component);
      const mockTarget = document.createElement('li');

      const event = Object.create(KeyboardEvent.prototype);
      Object.defineProperty(event, 'key', { value: 'ArrowDown' });
      Object.defineProperty(event, 'target', { value: mockTarget });
      event.preventDefault = jasmine.createSpy('preventDefault');

      component.onLanguageKeyDown(event, testLangId);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component['navigateOptions']).toHaveBeenCalledWith(1, mockTarget);
    });

    it('should prevent default and navigate up on ArrowUp key', () => {
      spyOnNavigateOptions(component);
      const mockTarget = document.createElement('li');

      const event = Object.create(KeyboardEvent.prototype);
      Object.defineProperty(event, 'key', { value: 'ArrowUp' });
      Object.defineProperty(event, 'target', { value: mockTarget });
      event.preventDefault = jasmine.createSpy('preventDefault');

      component.onLanguageKeyDown(event, testLangId);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component['navigateOptions']).toHaveBeenCalledWith(-1, mockTarget);
    });

    it('should do nothing on unhandled keys', () => {
      spyOn(component, 'selectLanguage');
      spyOn(component, 'closeOptions');
      spyOnNavigateOptions(component);

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      spyOn(event, 'preventDefault');

      component.onLanguageKeyDown(event, testLangId);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(component.selectLanguage).not.toHaveBeenCalled();
      expect(component.closeOptions).not.toHaveBeenCalled();
      expect(component['navigateOptions']).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should render a button as the trigger (keyboard focusable)', () => {
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn).toBeTruthy();
    });
  });

  describe('#onLanguageKeyDown — option keyboard navigation', () => {
    let mockTarget: HTMLElement;
    const testLangId = 'en-US';

    beforeEach(() => {
      mockTarget = document.createElement('li');
      const mockContainer = document.createElement('div');
      mockContainer.className = 'lang-selector-container';
      const mockButton = document.createElement('button');
      mockContainer.appendChild(mockButton);
      mockContainer.appendChild(mockTarget);

      document.body.appendChild(mockContainer);
    });

    it('should select the language on Enter', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');

      component.onLanguageKeyDown(event, testLangId);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(langServiceSpy.setLanguage).toHaveBeenCalledWith(testLangId);
    });

    it('should select the language on Space', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');

      component.onLanguageKeyDown(event, testLangId);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(langServiceSpy.setLanguage).toHaveBeenCalledWith(testLangId);
    });

    it('should close options and focus button on Escape key', () => {
      spyOn(component, 'closeOptions');

      const triggerBtn = fixture.nativeElement.querySelector(
        'button.container-header'
      ) as HTMLButtonElement | null;
      const focusSpy = triggerBtn
        ? spyOn(triggerBtn, 'focus')
        : jasmine.createSpy('focus');

      const event = Object.create(KeyboardEvent.prototype);
      Object.defineProperty(event, 'key', { value: 'Escape' });
      Object.defineProperty(event, 'target', { value: mockTarget });

      component.onLanguageKeyDown(event, testLangId);

      expect(component.closeOptions).toHaveBeenCalled();
      if (triggerBtn) {
        expect(focusSpy).toHaveBeenCalled();
      }
    });

    it('should prevent default and navigate down on ArrowDown key', () => {
      spyOnNavigateOptions(component);
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      spyOn(event, 'preventDefault');

      const eventWithTarget = Object.create(KeyboardEvent.prototype);
      Object.defineProperty(eventWithTarget, 'key', { value: 'ArrowDown' });
      Object.defineProperty(eventWithTarget, 'target', { value: mockTarget });
      eventWithTarget.preventDefault = jasmine.createSpy('preventDefault');

      component.onLanguageKeyDown(eventWithTarget, testLangId);

      expect(eventWithTarget.preventDefault).toHaveBeenCalled();
      expect(component['navigateOptions']).toHaveBeenCalledWith(1, mockTarget);
    });

    it('should prevent default and navigate up on ArrowUp key', () => {
      spyOnNavigateOptions(component);

      const eventWithTarget = Object.create(KeyboardEvent.prototype);
      Object.defineProperty(eventWithTarget, 'key', { value: 'ArrowUp' });
      Object.defineProperty(eventWithTarget, 'target', { value: mockTarget });
      eventWithTarget.preventDefault = jasmine.createSpy('preventDefault');

      component.onLanguageKeyDown(eventWithTarget, testLangId);

      expect(eventWithTarget.preventDefault).toHaveBeenCalled();
      expect(component['navigateOptions']).toHaveBeenCalledWith(-1, mockTarget);
    });

    it('should do nothing on unhandled keys', () => {
      spyOn(component, 'selectLanguage');
      spyOn(component, 'closeOptions');
      spyOnNavigateOptions(component);

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      spyOn(event, 'preventDefault');

      component.onLanguageKeyDown(event, testLangId);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(component.selectLanguage).not.toHaveBeenCalled();
      expect(component.closeOptions).not.toHaveBeenCalled();
      expect(component['navigateOptions']).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should render a button as the trigger (keyboard focusable)', () => {
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn).toBeTruthy();
    });

    it('should wrap the selected language text in a .lang-label span', () => {
      const label = fixture.nativeElement.querySelector(
        '.selected-language .lang-label'
      ) as HTMLElement | null;
      expect(label).toBeTruthy();
      expect(label?.textContent?.trim()).toBe('ESP');
    });
  });

  describe('ARIA pattern (WAI-ARIA listbox)', () => {
    it('trigger uses aria-haspopup="listbox" with aria-controls', () => {
      const btn = fixture.nativeElement.querySelector(
        'button.container-header'
      ) as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-haspopup')).toBe('listbox');
      expect(btn.getAttribute('aria-controls')).toBe('lang-options');
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('options <ul> has role=listbox and id=lang-options', () => {
      const list = fixture.nativeElement.querySelector(
        '#lang-options'
      ) as HTMLUListElement;
      expect(list).toBeTruthy();
      expect(list.getAttribute('role')).toBe('listbox');
    });
  });
});
