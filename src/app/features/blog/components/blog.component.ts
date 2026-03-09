import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { LangService } from '../../../core/services/lang.service';
import { BlogViewModel } from '../models/blog-view-model.model';
import { BodyContent, Post } from '../models/post.model';
import { ProcessedPost } from '../models/processed-post.model';
import { SanityService } from './../../../core/services/sanity.service';
import { PostCardComponent } from './post-card/post-card.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, PostCardComponent,LoadingComponent],
  providers: [SanityService],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, OnDestroy {
  private _sanityService = inject(SanityService);
  private _sanitizer = inject(DomSanitizer);
  private _activatedRoute = inject(ActivatedRoute);
  private _langService = inject(LangService);
  private _routeSubscription?: Subscription;

  private _currentSlug = signal<string | null>(null);

  currentLang = computed(() => this._langService.currentLanguage());

  processedArticles = computed(() => {
    const posts = this._sanityService.posts();
    const langCode = this.currentLang()?.startsWith('en') ? 'en' : 'es';

    return posts
      .map((article) => this._processPost(article, langCode))
      .filter((p) => p.publishedAt.getTime() <= Date.now())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  });

  selectedPost = computed(() => {
    const slug = this._currentSlug();
    if (!slug) return null;
    return (
      this.processedArticles().find((article) => article.slug === slug) ?? null
    );
  });

  vm = computed(
    (): BlogViewModel => ({
      posts: this.processedArticles(),
      hasSlug: !!this._currentSlug(),
      selectedPost: this.selectedPost(),
      currentLocale: this.currentLang()
    })
  );

  // Public signals for template
  posts = this._sanityService.posts;
  // loading = this._sanityService.loading;
  loading = signal(true);
  error = this._sanityService.error;
  hasError = this._sanityService.hasError;

  async ngOnInit() {
    await this._sanityService.loadPosts();
    this._routeSubscription = this._activatedRoute.paramMap.subscribe(
      (params) => {
        const slug = params.get('slug');
        this._currentSlug.set(slug);
      }
    );
  }

  ngOnDestroy() {
    this._routeSubscription?.unsubscribe();
  }

  get currentLocale(): string {
    return this._langService.currentLanguage();
  }

  refreshPosts(): Promise<void> {
    return this._sanityService.refreshPosts();
  }

  clearError(): void {
    this._sanityService.clearError();
  }

  private _processPost(article: Post, langCode: 'es' | 'en'): ProcessedPost {
    const title =
      langCode === 'en' && article.title.en
        ? article.title.en
        : article.title.es;

    const excerpt =
      langCode === 'en' && article.excerpt.en
        ? article.excerpt.en
        : article.excerpt.es;

    const bodyContent: BodyContent =
      langCode === 'en' && article.body.en ? article.body.en : article.body.es;

    const html = this._sanityService.portableTextToHtml(bodyContent);
    const safeHtml = this._sanitizer.bypassSecurityTrustHtml(html);

    const imageUrl = article.image
      ? this._sanityService
          .imageBuilder(article.image)
          .width(600)
          .height(400)
          .url()
      : '';

    return {
      _id: article._id,
      _createdAt: article._createdAt,
      slug: article.slug,
      publishedAt: article.publishedAt,
      title,
      excerpt,
      body: safeHtml,
      imageUrl,
      image: article.image
    };
  }
}
