import { CommonModule } from '@angular/common';
import { Component, input, signal, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-photo',
  imports: [CommonModule],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.scss'
})
export class PhotoComponent implements OnInit {
  imgSrc = input.required<string>();

  animationDelay = signal('0s');

  ngOnInit(): void {
    this.animationDelay.set(`${Math.random() * 3}s`);
  }
}
