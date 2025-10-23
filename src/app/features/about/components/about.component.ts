import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PhotoComponent } from '../../../shared/components/photo/photo.component';
import { ParallaxHeaderDirective } from '../../../shared/directives/parallax-header.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    PhotoComponent,
    CommonModule,
    TranslateModule,
    ParallaxHeaderDirective
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {}
