import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Post } from '../../../core/models/post.model';
import { SanityService } from './../../../core/services/sanity.service';
import { BlogArticleComponent } from './blog-article/blog-article.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, BlogArticleComponent],
  providers: [SanityService],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  private _sanityService = inject(SanityService);
  private _sanitizer = inject(DomSanitizer);

  articles$!: Observable<Post[]>;

  ngOnInit(): void {
    this.articles$ = this._sanityService.getPosts();
  }

  imageUrl(imageRef: any): string {
    return imageRef
      ? this._sanityService.imageBuilder(imageRef).width(600).height(400).url()
      : '';
  }

  getContent(body: any): SafeHtml {
    const html = this._sanityService.portableTextToHtml(body);
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }
}
