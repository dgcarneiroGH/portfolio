import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, NgFor, NgStyle } from '@angular/common';
import { take } from 'rxjs';
import { AnimateComponent } from '../animate/animate.component';
import { IMediumBlogPostsResponse } from '../../interfaces';
import { NodeToTextPipe } from '../../pipes/node-to-text.pipe';
import { PostsService } from '../../services/posts.service';
import { ShortenPipe } from '../../pipes/shorten.pipe';

@Component({
  selector: 'app-medium-blog',
  standalone: true,
  imports: [DatePipe, NgStyle, NodeToTextPipe, ShortenPipe],
  templateUrl: './medium-blog.component.html',
  styleUrls: ['./medium-blog.component.scss']
})
export class MediumBlogComponent extends AnimateComponent implements OnInit {
  posts: IMediumBlogPostsResponse = { items: [] };

  private postsService = inject(PostsService);

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    // this.postsService
    //   .getPosts()
    //   .pipe(take(1))
    //   .subscribe({
    //     next: (data: IMediumBlogPostsResponse) => {
    //       this.posts = data;
    //     },
    //     error: ({ error }) => alert(error.message)
    //   });
  }
}
