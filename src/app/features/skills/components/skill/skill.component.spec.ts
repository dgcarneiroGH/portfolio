import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { SkillComponent } from './skill.component';

const mockTranslations = {
  'COMMON.YEAR': 'year',
  'COMMON.YEARS': 'years'
};
const mockLoader = { getTranslation: () => of(mockTranslations) };

function setRequiredInputs(
  fixture: ComponentFixture<SkillComponent>,
  overrides: Partial<{
    progress: number;
    text: string;
    years: number;
    logoSrc: string;
    altKey: string;
    showProgressBar: boolean;
  }> = {}
): void {
  fixture.componentRef.setInput('progress', overrides.progress ?? 75);
  fixture.componentRef.setInput('text', overrides.text ?? 'Angular');
  fixture.componentRef.setInput('years', overrides.years ?? 3);
  fixture.componentRef.setInput(
    'logoSrc',
    overrides.logoSrc ?? '/assets/angular.svg'
  );
  fixture.componentRef.setInput(
    'altKey',
    overrides.altKey ?? 'SKILLS.ANGULAR_ALT'
  );
  if (overrides.showProgressBar !== undefined) {
    fixture.componentRef.setInput('showProgressBar', overrides.showProgressBar);
  }
}

describe('SkillComponent', () => {
  let component: SkillComponent;
  let fixture: ComponentFixture<SkillComponent>;
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SkillComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SkillComponent);
    component = fixture.componentInstance;
    translate = TestBed.inject(TranslateService);
    translate.use('es-ES');
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  describe('creation', () => {
    it('should create with required inputs', () => {
      setRequiredInputs(fixture);
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('#strokeDasharray (computed)', () => {
    it('should return "0 <circumference>" for 0% progress', () => {
      setRequiredInputs(fixture, { progress: 0 });
      fixture.detectChanges();
      const value = component.strokeDasharray();
      expect(value.startsWith('0 ')).toBeTrue();
    });

    it('should return a non-zero first segment for 50% progress', () => {
      setRequiredInputs(fixture, { progress: 50 });
      fixture.detectChanges();
      const [filled] = component.strokeDasharray().split(' ').map(Number);
      const circumference = Math.PI * 50;
      expect(filled).toBeCloseTo(circumference / 2, 1);
    });

    it('should return a string containing a space separator', () => {
      setRequiredInputs(fixture, { progress: 100 });
      fixture.detectChanges();
      expect(component.strokeDasharray()).toContain(' ');
    });
  });

  describe('#currentStrokeDasharray signal', () => {
    it('should start at "0 200" before showProgressBar is true', () => {
      setRequiredInputs(fixture, { showProgressBar: false });
      fixture.detectChanges();
      expect(component.currentStrokeDasharray()).toBe('0 200');
    });

    it('should update to computed value after showProgressBar becomes true', async () => {
      setRequiredInputs(fixture, { showProgressBar: false });
      fixture.detectChanges();

      fixture.componentRef.setInput('showProgressBar', true);
      fixture.detectChanges();

      // Wait a short time for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 350));
      fixture.detectChanges();

      expect(component.currentStrokeDasharray()).not.toBe('0 200');
    });
  });

  describe('#experienceText (computed)', () => {
    it('should use singular "year" for 1 year', () => {
      setRequiredInputs(fixture, { years: 1 });
      fixture.detectChanges();
      expect(component.experienceText()).toBe('1 year');
    });

    it('should use plural "years" for multiple years', () => {
      setRequiredInputs(fixture, { years: 3 });
      fixture.detectChanges();
      expect(component.experienceText()).toBe('3 years');
    });
  });

  describe('#onKeyDown — keyboard accessibility', () => {
    it('should call toggleProgress on Enter', () => {
      setRequiredInputs(fixture);
      fixture.detectChanges();
      const spy = spyOn(component, 'toggleProgress');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(spy).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call toggleProgress on Space', () => {
      setRequiredInputs(fixture);
      fixture.detectChanges();
      const spy = spyOn(component, 'toggleProgress');
      component.onKeyDown(new KeyboardEvent('keydown', { key: ' ' }));
      expect(spy).toHaveBeenCalled();
    });

    it('should NOT call toggleProgress for other keys', () => {
      setRequiredInputs(fixture);
      fixture.detectChanges();
      const spy = spyOn(component, 'toggleProgress');
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'Tab' }));
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
