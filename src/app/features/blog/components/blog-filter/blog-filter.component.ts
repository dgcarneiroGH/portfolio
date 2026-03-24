import { Component, EventEmitter, Output, signal } from '@angular/core';
import { BLOG_FILTERS } from '../../constants/blog-filter.constants';
import { BlogFilter, PostCategoryType } from '../../models/blog-filter.model';
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
  
  selectedFilter = signal<PostCategoryType | null>(null);
  
  @Output() filterChange = new EventEmitter<PostCategoryType | null>();

  selectFilter(filter: BlogFilter): void {
    this.selectedFilter.set(filter.category);
    this.filterChange.emit(filter.category);
  }

  isFilterSelected(filter: BlogFilter): boolean {
    return this.selectedFilter() === filter.category;
  }
}
