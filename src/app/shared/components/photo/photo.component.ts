import { CommonModule } from '@angular/common';
import { Component, computed, input, signal, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-photo',
  imports: [CommonModule],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.scss'
})
export class PhotoComponent implements OnInit {
  imgBase = input.required<string>();
  altText = input.required<string>();

  photoClass = computed(() => `photo-${this.imgBase()}`);

  animationDelay = signal('0s');

  ngOnInit(): void {
    this.animationDelay.set(`${Math.random() * 3}s`);
  }
}
