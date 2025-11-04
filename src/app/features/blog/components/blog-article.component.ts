import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-article.component.html',
  styleUrls: ['./blog-article.component.scss']
})
export class BlogArticleComponent {
  @Input() title: string = '';
  @Input() content: string = '';
}
