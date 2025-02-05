import { Component, OnInit } from '@angular/core';
import { PictureComponent } from '../../shared/picture/picture.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PictureComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  // linkedin = SocialMediaProfiles.filter(
  //   (x) => x.title.toLowerCase().trim() == 'linkedin'
  // )[0];

  // options: TagCanvasOptions = TAG_CANVAS_OPTIONS;
  screenWidth!: number;
  // tags: ITag[] = TAGS;

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }
}
