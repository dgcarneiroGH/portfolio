import { Component } from '@angular/core';
import { BLOG_FILTERS } from '../../constants/blog-filter.constants';
import { BlogFilter } from '../../models/blog-filter.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-blog-filter',
  standalone: true,
  templateUrl: './blog-filter.component.html',
  styleUrls: ['./blog-filter.component.scss'],
  imports: [TranslateModule]
})
export class BlogFilterComponent {
  readonly filters: BlogFilter[] = BLOG_FILTERS;
}
