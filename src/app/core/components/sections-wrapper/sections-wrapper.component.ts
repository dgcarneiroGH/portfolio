import { CommonModule } from '@angular/common';
import {
  Component,
  signal,
  computed,
  AfterViewInit,
  ElementRef,
  viewChild,
  OnDestroy,
  inject
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AboutComponent } from '../../../features/about/components/about.component';
import { ContactComponent } from '../../../features/contact/components/contact.component';
import { ExperienceComponent } from '../../../features/experience/components/experience.component';
import { HomeComponent } from '../../../features/home/components/home.component';
import { ProjectsComponent } from '../../../features/projects/components/projects.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContactFormComponent } from '../../../features/contact/components/contact-form.component';

@Component({
  selector: 'app-sections-wrapper',
  standalone: true,
  imports: [
    HomeComponent,
    AboutComponent,
    ExperienceComponent,
    ContactComponent,
    ProjectsComponent,
    CommonModule,
    RouterModule,
    TranslateModule,
    ContactFormComponent
  ],
  templateUrl: './sections-wrapper.component.html',
  styleUrls: ['./sections-wrapper.component.scss']
})
export class SectionsWrapperComponent implements AfterViewInit, OnDestroy {
  private _translateService = inject(TranslateService);
  private observer?: IntersectionObserver;

  private _actualYear = signal(new Date().getFullYear());
  actualYear = this._actualYear.asReadonly();

  loadingImage = computed(() => {
    const currentLang = this._translateService.currentLang || 'es-ES';
    return currentLang.startsWith('en')
      ? 'assets/images/nomacoda/loading_en.avif'
      : 'assets/images/nomacoda/loading_es.avif';
  });

  private _showAbout = signal(false);
  private _showProjects = signal(false);
  private _showExperience = signal(false);
  private _showContact = signal(false);
  private _showContactForm = signal(false);

  showAbout = this._showAbout.asReadonly();
  showProjects = this._showProjects.asReadonly();
  showExperience = this._showExperience.asReadonly();
  showContact = this._showContact.asReadonly();
  showContactForm = this._showContactForm.asReadonly();

  aboutTrigger = viewChild.required<ElementRef<HTMLDivElement>>('aboutTrigger');
  projectsTrigger =
    viewChild.required<ElementRef<HTMLDivElement>>('projectsTrigger');
  experienceTrigger =
    viewChild.required<ElementRef<HTMLDivElement>>('experienceTrigger');
  contactTrigger =
    viewChild.required<ElementRef<HTMLDivElement>>('contactTrigger');
  contactFormTrigger =
    viewChild.required<ElementRef<HTMLDivElement>>('contactFormTrigger');

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private setupIntersectionObserver() {
    /**
     * 🗺️ Trigger-to-Action Map
     *
     * This Map creates a direct relationship between DOM trigger elements and their
     * corresponding signal update functions. Instead of using multiple if-else
     * comparisons, we use O(1) Map lookup for better performance and cleaner code.
     *
     * Structure: [triggerElement] -> [signalUpdateFunction]
     * When a trigger enters viewport, we execute its mapped function to show the component.
     */
    const triggerActionMap = new Map<HTMLDivElement, () => void>([
      [
        this.aboutTrigger().nativeElement,
        () => {
          setTimeout(() => {
            this._showAbout.set(true);
          }, 5000);
        }
      ],
      [
        this.projectsTrigger().nativeElement,
        () => this._showProjects.set(true)
      ],
      [
        this.experienceTrigger().nativeElement,
        () => this._showExperience.set(true)
      ],
      [this.contactTrigger().nativeElement, () => this._showContact.set(true)],
      [
        this.contactFormTrigger().nativeElement,
        () => this._showContactForm.set(true)
      ]
    ]);

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const trigger = entry.target as HTMLDivElement;
            const showComponentAction = triggerActionMap.get(trigger);

            if (showComponentAction) {
              showComponentAction(); // Execute the mapped function
              this.observer?.unobserve(trigger); // Stop observing this trigger
            }
          }
        });
      },
      {
        rootMargin: '200px 0px', // Load components 200px before they enter viewport
        threshold: 0.1 // Trigger when 10% of element is visible
      }
    );

    // Start observing all trigger elements
    triggerActionMap.forEach((_, trigger) => {
      this.observer?.observe(trigger);
    });
  }
}
