import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SectionsWrapperComponent } from './sections-wrapper.component';

const mockLoader = { getTranslation: () => of({}) };

// Minimal stub components so we don't need to provide deep dependency trees
@Component({ template: '' })
class HomeStubComponent {}
@Component({ template: '' })
class AboutStubComponent {}
@Component({ template: '' })
class ExperienceStubComponent {}
@Component({ template: '' })
class ContactStubComponent {}
@Component({ template: '' })
class ProjectsStubComponent {}

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
      // Replace SectionsWrapperComponent's deep imports with lightweight stubs
      .overrideComponent(SectionsWrapperComponent, {
        set: {
          imports: [RouterLink, TranslateModule],
          // Minimal template that retains the required #trigger template variables
          template: `
          <div class="sections-wrapper">
            <div #aboutTrigger></div>
            <div #projectsTrigger></div>
            <div #experienceTrigger></div>
            <div #contactTrigger><a routerLink="/blog"></a></div>
          </div>
        `
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

  it('should compute a loading image URL', () => {
    expect(component.loadingImage()).toContain('loading_');
  });

  it('should start with all lazy signals as false', () => {
    expect(component.showAbout()).toBeFalse();
    expect(component.showProjects()).toBeFalse();
    expect(component.showExperience()).toBeFalse();
    expect(component.showContact()).toBeFalse();
  });
});
