import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-photo',
  imports: [CommonModule],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.scss'
})
export class PhotoComponent implements OnInit {
  @Input() imgSrc!: string;

  animationDelay: string = '0s';

  ngOnInit(): void {
    this.animationDelay = `${Math.random() * 3}s`;
  }
}
