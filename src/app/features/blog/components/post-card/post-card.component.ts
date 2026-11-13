import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SanityService } from '../../../../core/services/sanity.service';
import { BLOG_FILTERS } from '../../constants/blog-filter.constants';
import { PostCategoryType } from '../../models/blog-filter.model';
import { SanityImage } from '../../../../core/models/sanity.models';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent {
  private _router = inject(Router);
  private _sanityService = inject(SanityService);

  @Input() title!: string;
  @Input() date!: Date;
  @Input() image?: SanityImage;
  @Input() excerpt!: string;
  @Input() slug!: string;
  @Input() currentLocale!: string;
  @Input() category?: string;
  /** Tarjeta destacada (la más reciente del listado): chip de categoría en vez de punto. */
  @Input() featured = false;

  get categoryLabel(): string | null {
    if (!this.category) return null;
    const filter = BLOG_FILTERS.find((f) => f.category === this.category);
    return filter ? filter.label : null;
  }

  /** Clase de tema que fija el color de acento según la categoría. */
  get themeClass(): string {
    switch (this.category) {
      case PostCategoryType.NEWS:
        return 'post-card--news';
      case PostCategoryType.CODERS4CHANGE:
        return 'post-card--coders4change';
      case PostCategoryType.MINDFUL_CODE:
        return 'post-card--mindful-code';
      case PostCategoryType.N8N_WORKFLOWS:
        return 'post-card--n8n-workflows';
      default:
        return 'post-card--default';
    }
  }

  get bgUrl(): string {
    if (!this.image) return '';

    return (
      this._sanityService
        .imageBuilder(this.image)
        .width(1200)
        .height(800)
        .url() ?? ''
    );
  }

  navigateToPostDetail(): void {
    const url = '/blog/' + this.slug;
    this._router.navigate([url]);
  }
}
