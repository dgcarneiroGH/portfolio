import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ColorThiefService } from '@soarlin/angular-color-thief';

@Component({
  standalone: true,
  selector: 'app-project',
  imports: [CommonModule, TranslateModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  private _colorThief: ColorThiefService = inject(ColorThiefService);

  dominantColor: [number, number, number] | null = null;
  palette: [number, number, number][] | null = null;

  @Input() coverImgSrc!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() url?: string = '';

  showMoreInfo: boolean = false;
  animationDelay: string = '0s';

  ngOnInit(): void {
    this.animationDelay = `${Math.random() * 5}s`;
  }

  onImageLoad(imageElement: HTMLImageElement) {
    // Get dominant color
    this.dominantColor = this._colorThief.getColor(imageElement);

    // Get color palette (default 10 colors)
    this.palette = this._colorThief.getPalette(imageElement);

    console.log(this.dominantColor);
    console.log(this.palette);
  }

  toggleMoreInfo() {
    this.showMoreInfo = !this.showMoreInfo;
  }

  goTo() {
    if (this.url) window.open(this.url, '_blank');
  }
}
