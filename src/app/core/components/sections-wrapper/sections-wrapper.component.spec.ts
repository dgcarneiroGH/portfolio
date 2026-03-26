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

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set data-slide-dir to forward and change activeSlide when going forward', (done) => {
    component.activeSlide.set(0);
    component.goToSlide(1);
    expect(document.documentElement.getAttribute('data-slide-dir')).toBe(
      'forward'
    );
    setTimeout(() => {
      expect(component.activeSlide()).toBe(1);
      expect(
        document.documentElement.getAttribute('data-slide-dir')
      ).toBeNull();
      done();
    }, 450);
  });

  it('should set data-slide-dir to backward and change activeSlide when going backward', (done) => {
    component.activeSlide.set(1);
    component.goToSlide(0);
    expect(document.documentElement.getAttribute('data-slide-dir')).toBe(
      'backward'
    );
    setTimeout(() => {
      expect(component.activeSlide()).toBe(0);
      expect(
        document.documentElement.getAttribute('data-slide-dir')
      ).toBeNull();
      done();
    }, 450);
  });

  it('should not change activeSlide if target is the same', (done) => {
    component.activeSlide.set(1);
    component.goToSlide(1);
    // No dirección, pero por implementación actual será backward
    expect(document.documentElement.getAttribute('data-slide-dir')).toBe(
      'backward'
    );
    setTimeout(() => {
      expect(component.activeSlide()).toBe(1);
      expect(
        document.documentElement.getAttribute('data-slide-dir')
      ).toBeNull();
      done();
    }, 450);
  });
});
