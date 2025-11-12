import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ColorThiefService } from '@soarlin/angular-color-thief';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  standalone: true,
  selector: 'app-project',
  imports: [CommonModule, TranslateModule, ButtonComponent],
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
  palette = signal<[number, number, number][] | null>(null);

  animationDelay: string = '0s';

  dynamicGradient = computed(() => {
    const palette = this.palette();
    if (!palette || palette.length <= 1) return '';
    return `linear-gradient(135deg, rgb(${palette[0].join(',')}), rgb(${palette[1].join(',')}))`;
  });

  textColor = computed(() => {
    const palette = this.palette();
    return palette && palette[1] ? `rgb(${palette[1].join(',')})` : '#f6f8fa';
  });

  btnColor = computed(() => {
    const palette = this.palette();
    return palette && palette[1] ? `${palette[1].join(',')}` : '41,182,246';
  });

  get showMoreInfo(): boolean {
    return this.expandedIndex === this.index;
  }

  ngOnInit(): void {
    this.animationDelay = `${Math.random() * 5}s`;
  }

  onImageLoad(imageElement: HTMLImageElement) {
    this.dominantColor = this._colorThief.getColor(imageElement);
    this.palette.set(this._colorThief.getPalette(imageElement));
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

  canToggleInfo(): boolean {
    return this.expandedIndex === null || this.expandedIndex === this.index;
  }

  handleMoreInfoClick(): void {
    if (this.canToggleInfo()) {
      this.toggleMoreInfo();
    }
  }

  onKeyDown(event: KeyboardEvent, action: 'goTo' | 'toggleInfo') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (action === 'goTo') {
        this.goTo();
      } else {
        this.handleMoreInfoClick();
      }
    }
  }
}
