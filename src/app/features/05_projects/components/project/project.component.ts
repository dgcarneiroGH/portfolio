import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
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

  @Input() coverImgSrc!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() url?: string = '';
  @Input() index!: number;
  @Input() expandedIndex!: number | null;
  @Output() expandRequest = new EventEmitter<number>();

  dominantColor: [number, number, number] | null = null;
  palette: [number, number, number][] | null = null;

  animationDelay: string = '0s';

  get showMoreInfo(): boolean {
    return this.expandedIndex === this.index;
  }

  ngOnInit(): void {
    this.animationDelay = `${Math.random() * 5}s`;
  }

  onImageLoad(imageElement: HTMLImageElement) {
    this.dominantColor = this._colorThief.getColor(imageElement);
    this.palette = this._colorThief.getPalette(imageElement);
  }

  toggleMoreInfo() {
    if (this.expandedIndex === this.index) {
      this.expandRequest.emit(-1); // Cierra
    } else {
      this.expandRequest.emit(this.index); // Abre
    }
  }

  goTo() {
    if (this.url) window.open(this.url, '_blank');
  }

  getDynamicGradient(): string {
    if (!this.palette || this.palette.length <= 1) return '';
    return `linear-gradient(135deg, rgb(${this.palette[0].join(
      ','
    )}), rgb(${this.palette[1].join(',')}))`;
  }

  getTextColor(): string {
    return this.palette && this.palette[1]
      ? `rgb(${this.palette[1].join(',')})`
      : '#f6f8fa';
  }

  canToggleInfo(): boolean {
    return this.expandedIndex === null || this.expandedIndex === this.index;
  }

  handleMoreInfoClick(): void {
    if (this.canToggleInfo()) {
      this.toggleMoreInfo();
    }
  }
}
