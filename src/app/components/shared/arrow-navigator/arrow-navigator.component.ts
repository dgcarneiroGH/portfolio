import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ToggleNavMenuDirective } from 'src/app/directives/toggle-nav-menu.directive';

@Component({
  selector: 'app-arrow-navigator',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ToggleNavMenuDirective],
  templateUrl: './arrow-navigator.component.html',
  styleUrl: './arrow-navigator.component.scss'
})
export class ArrowNavigatorComponent {
  @Input() direction!: 'up' | 'down';
  @Input() visible = true;

  navMenuItems = [{ title: '', link: '' }];
}
