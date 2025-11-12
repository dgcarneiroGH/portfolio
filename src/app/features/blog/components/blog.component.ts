import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { combineLatest, distinctUntilChanged, map, Observable, shareReplay, startWith } from 'rxjs';
import { LangService } from '../../../core/services/lang.service';
import { BlogViewModel } from '../models/blog-view-model.model';
import { BodyContent, Post } from '../models/post.model';
import { ProcessedPost } from '../models/processed-post.model';
import { SanityService } from './../../../core/services/sanity.service';
import { PostCardComponent } from './post-card/post-card.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, PostCardComponent],
  providers: [SanityService],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent {
  private _sanityService = inject(SanityService);
  private _sanitizer = inject(DomSanitizer);
  private _activatedRoute = inject(ActivatedRoute);
  private _langService = inject(LangService);
  private _translateService = inject(TranslateService);

  private _articles$: Observable<Post[]> = this._sanityService
    .getPosts()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  private _slug$ = this._activatedRoute.paramMap.pipe(
    map((params) => params.get('slug')),
    distinctUntilChanged()
  );

  private _currentLang$ = this._translateService.onLangChange.pipe(
    map((event) => event.lang),
    startWith(this._translateService.currentLang || 'es-ES'),
    distinctUntilChanged()
  );

  private _processedArticles$ = combineLatest([this._articles$, this._currentLang$]).pipe(
    map(([posts, currentLang]) => {
      const langCode = currentLang?.startsWith('en') ? 'en' : 'es';
      return posts
        .map((article) => this._processPost(article, langCode))
        .filter((p) => p.publishedAt.getTime() <= Date.now())
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  vm$: Observable<BlogViewModel> = combineLatest([
    this._processedArticles$,
    this._slug$,
    this._currentLang$
  ]).pipe(
    map(([posts, slug, currentLocale]) => ({
      posts,
      hasSlug: !!slug,
      selectedPost: slug != null ? (posts.find((article) => article.slug === slug) ?? null) : null,
      currentLocale
    }))
  );

  get currentLocale(): string {
    return this._langService.getLanguage();
  }

  private _processPost(article: Post, langCode: 'es' | 'en'): ProcessedPost {
    const title = langCode === 'en' && article.title.en ? article.title.en : article.title.es;

    const excerpt =
      langCode === 'en' && article.excerpt.en ? article.excerpt.en : article.excerpt.es;

    const bodyContent: BodyContent =
      langCode === 'en' && article.body.en ? article.body.en : article.body.es;

    const html = this._sanityService.portableTextToHtml(bodyContent);
    const safeHtml = this._sanitizer.bypassSecurityTrustHtml(html);

    const imageUrl = article.image
      ? this._sanityService.imageBuilder(article.image).width(600).height(400).url()
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
