import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CodeWindowComponent } from './code-window.component';

const mockLoader = { getTranslation: () => of({}) };

describe('CodeWindowComponent', () => {
  let component: CodeWindowComponent;
  let fixture: ComponentFixture<CodeWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CodeWindowComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the window as an image with a translated accessible name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const codeWindow = compiled.querySelector<HTMLElement>('.code-window');

    expect(codeWindow?.getAttribute('role')).toBe('img');
    expect(codeWindow?.getAttribute('aria-label')).toContain(
      'HOME.CODE_WINDOW_ARIA'
    );
  });

  it('should mark every decorative part as aria-hidden', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const decorative = compiled.querySelectorAll('[aria-hidden="true"]');
    const parts = compiled.querySelectorAll(
      '.code-bar, .code-body, .code-status, .code-socket'
    );

    expect(decorative.length).toBe(parts.length);
    expect(parts.length).toBe(4);
  });
});
