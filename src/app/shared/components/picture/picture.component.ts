import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-picture',
  imports: [CommonModule],
  templateUrl: './picture.component.html',
  styleUrl: './picture.component.scss'
})
export class PictureComponent implements OnInit {
  @Input() imgSrc!: string;

  animationDelay: string = '0s';

  ngOnInit(): void {
    this.animationDelay = `${Math.random() * 3}s`;
  }
}
