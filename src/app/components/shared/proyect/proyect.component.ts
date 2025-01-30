import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-proyect',
  imports: [CommonModule],
  templateUrl: './proyect.component.html',
  styleUrl: './proyect.component.scss'
})
export class ProyectComponent {
  @Input() coverImgSrc!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() url?: string = '';

  showMoreInfo: boolean = false;

  toggleMoreInfo() {
    this.showMoreInfo = !this.showMoreInfo;
  }

  goTo() {
    if (this.url) window.open(this.url, '_blank');
  }
}
