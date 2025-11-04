import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BlogArticleComponent } from './blog-article.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, BlogArticleComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent {
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
}
