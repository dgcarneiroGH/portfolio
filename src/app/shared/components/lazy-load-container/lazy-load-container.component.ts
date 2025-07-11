import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';

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

  constructor(private elRef: ElementRef) {}

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
