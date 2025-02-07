import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { PictureComponent } from '../../shared/picture/picture.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PictureComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  screenWidth!: number;

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }
}
