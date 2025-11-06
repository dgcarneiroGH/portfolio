import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LangService } from '../../../../core/services/lang.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { PhotoComponent } from '../../../../shared/components/photo/photo.component';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [CommonModule, PhotoComponent, ButtonComponent],
  templateUrl: './blog-article.component.html',
  styleUrls: ['./blog-article.component.scss']
})
export class BlogArticleComponent {
  private _langService = inject(LangService);
  private _router = inject(Router);

  @Input() title!: string;
  @Input() content!: SafeHtml;
  @Input() date!: Date;
  @Input() imgUrl?: string;
  @Input() slug!: string;

  get currentLocale(): string {
    return this._langService.getLanguage();
  }

  navigateToPostDetail(): void {
    const url = '/blog/' + this.slug;
    this._router.navigate([url]);
  }
}
