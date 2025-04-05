import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-proyect',
  imports: [CommonModule],
  templateUrl: './proyect.component.html',
  styleUrl: './proyect.component.scss'
})
export class ProyectComponent implements OnInit {
  @Input() coverImgSrc!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() url?: string = '';

  showMoreInfo: boolean = false;
  animationDelay: string = '0s';

  ngOnInit(): void {
    this.animationDelay = `${Math.random() * 5}s`;
  }

  toggleMoreInfo() {
    this.showMoreInfo = !this.showMoreInfo;
  }

  goTo() {
    if (this.url) window.open(this.url, '_blank');
  }
}
