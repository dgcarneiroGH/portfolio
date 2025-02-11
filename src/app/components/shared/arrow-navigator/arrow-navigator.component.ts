import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-arrow-navigator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './arrow-navigator.component.html',
  styleUrl: './arrow-navigator.component.scss'
})
export class ArrowNavigatorComponent {
  @Input() direction!: 'up' | 'down';
  @Input() visible = true;
}
