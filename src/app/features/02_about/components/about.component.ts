import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PictureComponent } from 'src/app/shared/components/picture/picture.component';
import { ParallaxHeaderDirective } from 'src/app/shared/directives/parallax-header.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    PictureComponent,
    CommonModule,
    TranslateModule,
    ParallaxHeaderDirective
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {}
