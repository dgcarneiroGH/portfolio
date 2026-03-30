import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SectionsWrapperComponent } from './sections-wrapper.component';
import { ExperienceComponent } from '../../../features/experience/components/experience.component';
import { HomeComponent } from '../../../features/home/components/home.component';
import { AboutComponent } from '../../../features/about/components/about.component';
import { ProjectsComponent } from '../../../features/projects/components/projects.component';
import { ReviewsComponent } from '../../../features/reviews/components/reviews.component';
import { ContactComponent } from '../../../features/contact/components/contact.component';

const mockLoader = { getTranslation: () => of({}) };

describe('SectionsWrapperComponent', () => {
  let component: SectionsWrapperComponent;
  let fixture: ComponentFixture<SectionsWrapperComponent>;

  beforeEach(async () => {
    // Mock startViewTransition so the real browser View Transition API is not
    // triggered in tests (it throws InvalidStateError in that context).
    (document as any).startViewTransition = (cb: () => void) => {
      cb();
      return { ready: Promise.resolve(), finished: Promise.resolve(), updateCallbackDone: Promise.resolve() };
    };

    await TestBed.configureTestingModule({
      imports: [
        SectionsWrapperComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    })
      .overrideComponent(SectionsWrapperComponent, {
        set: {
          imports: [
            RouterLink,
            TranslateModule,
            ExperienceComponent,
            ContactComponent,
            HomeComponent,
            AboutComponent,
            ProjectsComponent,
            ReviewsComponent
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SectionsWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    // Clean up mock and any leftover attribute
    delete (document as any).startViewTransition;
    document.documentElement.removeAttribute('data-slide-dir');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set data-slide-dir to forward and change activeSlide when going forward', async () => {
    component.activeSlide.set(0);
    component.goToSlide(1);

    expect(document.documentElement.getAttribute('data-slide-dir')).toBe('forward');
    expect(component.activeSlide()).toBe(1);

    // Wait for the setTimeout that removes the attribute (400ms)
    await new Promise(resolve => setTimeout(resolve, 450));
    expect(document.documentElement.getAttribute('data-slide-dir')).toBeNull();
  });

  it('should set data-slide-dir to backward and change activeSlide when going backward', async () => {
    component.activeSlide.set(1);
    component.goToSlide(0);

    expect(document.documentElement.getAttribute('data-slide-dir')).toBe('backward');
    expect(component.activeSlide()).toBe(0);

    await new Promise(resolve => setTimeout(resolve, 450));
    expect(document.documentElement.getAttribute('data-slide-dir')).toBeNull();
  });

  it('should not change activeSlide if target is the same', async () => {
    component.activeSlide.set(1);
    component.goToSlide(1);

    // Direction is computed as backward when target === current (not greater)
    expect(document.documentElement.getAttribute('data-slide-dir')).toBe('backward');
    expect(component.activeSlide()).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 450));
    expect(document.documentElement.getAttribute('data-slide-dir')).toBeNull();
  });
});
