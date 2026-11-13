import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SKILLS } from '../../constants/skills.constants';
import { SkillsComponent } from './skills.component';

const mockLoader = { getTranslation: () => of({}) };

describe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SkillsComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the skills from constants', () => {
    expect(component.skills).toEqual(SKILLS);
  });

  it('should render a pill per skill with its icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const pills = compiled.querySelectorAll('.skill-pill');
    const icons = compiled.querySelectorAll('.skill-pill-icon');

    expect(pills.length).toBe(SKILLS.length);
    expect(icons.length).toBe(SKILLS.length);
  });

  it('should mark skill icons as decorative', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icons = compiled.querySelectorAll<HTMLImageElement>(
      '.skill-pill-icon'
    );

    icons.forEach((icon) => expect(icon.getAttribute('alt')).toBe(''));
  });
});
