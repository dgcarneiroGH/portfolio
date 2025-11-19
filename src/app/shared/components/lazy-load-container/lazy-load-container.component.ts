import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-lazy-load-container',
  templateUrl: './lazy-load-container.component.html',
  styleUrls: ['./lazy-load-container.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class LazyLoadContainerComponent implements OnInit, OnDestroy {
  @ViewChild('loading', { static: true })
  loadingTemplate!: TemplateRef<unknown>;

  isVisible = false;
  private observer!: IntersectionObserver;
  private translateService = inject(TranslateService);

  loadingImage$ = this.translateService.onLangChange.pipe(
    map(() => this.getLoadingImage()),
    startWith(this.getLoadingImage())
  );

  constructor(private elRef: ElementRef) {}

  private getLoadingImage(): string {
    const currentLang = this.translateService.currentLang || 'es-ES';
    return currentLang.startsWith('en')
      ? 'assets/images/nomacoda/loading_en.avif'
      : 'assets/images/nomacoda/loading_es.avif';
  }

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
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
