import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Post } from '../../../core/models/post.model';
import { SanityService } from '../../../core/services/sanity.service';
import { BlogArticleComponent } from './blog-article/blog-article.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, BlogArticleComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  private _sanity = inject(SanityService);

  posts$!: Observable<Post[]>;

  actualYear: number = new Date().getFullYear();
  articles = [
    {
      title: 'Lorem Ipsum Dolor Sit Amet',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur quis nisi non metus suscipit faucibus. Cras nec sem vel ligula luctus gravida. Donec vel justo sit amet quam fringilla aliquet. Integer suscipit, velit et ultricies pretium, erat felis euismod lacus, id cursus lacus risus id lectus.'
    },
    {
      title: 'Consectetur Adipiscing Elit',
      content:
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Phasellus vulputate, augue in dapibus efficitur, enim justo tincidunt augue, eget gravida odio nisl ac sapien.'
    }
  ];

  ngOnInit(): void {
    const query = `*[_type == "post"] | order(_createdAt desc){
      _id, title, "slug": slug.current, body, mainImage
    }`;
    this.posts$ = this._sanity.fetch$(query);

    this.posts$.subscribe((posts) => {
      this.articles = this._mapPosts(posts);
    });
  }

  imageUrl(imageRef: any) {
    return this._sanity
      .imageBuilder(imageRef.mainImage)
      .width(600)
      .height(400)
      .url();
    // return this._sanity.imageUrl(imageRef);
    // .width(600)
    // .height(400)
    // .fit('crop')
    // .url();
    // Si quieres opciones específicas puedes exponer funciones en el service para chain
  }

  private _mapPosts(posts: Post[]): {
    title: string;
    content: string;
  }[] {
    console.log(posts[0].body);

    return posts.map((p) => ({ title: p.title, content: '' }));
  }
}
