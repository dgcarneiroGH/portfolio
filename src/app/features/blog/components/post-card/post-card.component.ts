import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SanityService } from '../../../../core/services/sanity.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SanityImage } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TranslateModule],
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
