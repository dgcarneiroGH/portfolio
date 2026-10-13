import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';

const mockLoader = { getTranslation: () => of({}) };

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the primary CTA as a link to the contact section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cta = compiled.querySelector<HTMLAnchorElement>('a.cta--primary');

    expect(cta?.getAttribute('href')).toBe('#contacto');
  });

  it('should render the secondary CTA as a button without action', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cta = compiled.querySelector<HTMLButtonElement>('button.cta--secondary');

    expect(cta).toBeTruthy();
  });

  it('should render the skills section', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-skills')).toBeTruthy();
  });

  it('should render the code window component', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-code-window')).toBeTruthy();
  });
});
