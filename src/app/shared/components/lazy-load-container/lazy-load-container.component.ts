import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  viewChild,
  signal,
  computed
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-lazy-load-container',
  templateUrl: './lazy-load-container.component.html',
  styleUrls: ['./lazy-load-container.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class LazyLoadContainerComponent implements OnInit, OnDestroy {
  loadingTemplate = viewChild.required<TemplateRef<unknown>>('loading');

  private _isVisible = signal(false);
  isVisible = this._isVisible.asReadonly();

  private observer!: IntersectionObserver;
  private translateService = inject(TranslateService);

  loadingImage = computed(() => {
    const currentLang = this.translateService.currentLang || 'es-ES';
    return currentLang.startsWith('en')
      ? 'assets/images/nomacoda/loading_en.avif'
      : 'assets/images/nomacoda/loading_es.avif';
  });

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this._isVisible.set(true);
          this.observer.disconnect();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    this.observer.observe(this.elRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
