import { Component } from '@angular/core';
import { BLOG_FILTERS } from '../../constants/blog-filter.constants';
import { BlogFilter } from '../../models/blog-filter.model';

@Component({
  selector: 'app-blog-filter',
  standalone: true,
  templateUrl: './blog-filter.component.html',
  styleUrls: ['./blog-filter.component.scss']
})
export class BlogFilterComponent {
  readonly filters: BlogFilter[] = BLOG_FILTERS;
}
