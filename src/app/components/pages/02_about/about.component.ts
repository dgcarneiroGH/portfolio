import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';
import { PictureComponent } from '../../shared/picture/picture.component';
import { ScrollService } from '../../../services/scroll.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PictureComponent, CommonModule],
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
