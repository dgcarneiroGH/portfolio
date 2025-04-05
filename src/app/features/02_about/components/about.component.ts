import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollService } from 'src/app/core/services/scroll.service';
import { PictureComponent } from 'src/app/shared/components/picture/picture.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PictureComponent, CommonModule, TranslateModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  private _scrollService = inject(ScrollService);

  hasReachedTop = true;

  ngOnInit(): void {
    this._scrollService.hasReachedTop$.subscribe(
      (value) => (this.hasReachedTop = value)
    );
  }
}
