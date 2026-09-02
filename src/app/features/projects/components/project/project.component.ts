import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { PROJECT_PALETTES } from '../../constants/project-palettes';

@Component({
  standalone: true,
  selector: 'app-project',
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  private _translate = inject(TranslateService);

  coverImgSrc = input.required<string>();
  name = input.required<string>();
  description = input.required<string>();
  altKey = input.required<string>();
  url = input<string | undefined>(undefined);
  index = input.required<number>();
  expandedIndex = input.required<number | null>();

  expandRequest = output<number>();

  palette = signal<[string, string] | null>(null);
  animationDelay = signal('0s');

  dynamicGradient = computed(() => {
    const palette = this.palette();
    if (!palette || palette.length <= 1) return '';
    return `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`;
  });

  btnColor = computed(() => {
    const palette = this.palette();
    return palette && palette[1] ? palette[1] : '41,182,246';
  });

  showMoreInfo = computed(() => {
    return this.expandedIndex() === this.index();
  });

  canToggleInfo = computed(() => {
    return (
      this.expandedIndex() === null || this.expandedIndex() === this.index()
    );
  });

  ngOnInit(): void {
    const randomDelay = `${Math.random() * 5}s`;
    this.animationDelay.set(randomDelay);
    this.palette.set(PROJECT_PALETTES[this.coverImgSrc()] ?? null);
  }

  toggleMoreInfo() {
    this.expandedIndex() === this.index()
      ? this.expandRequest.emit(-1) // Close
      : this.expandRequest.emit(this.index()); // Open
  }

  goTo() {
    const url = this.url();
    if (url && url.trim()) window.open(url, '_blank');
  }

  handleMoreInfoClick(): void {
    if (this.canToggleInfo()) this.toggleMoreInfo();
  }

  onKeyDown(event: KeyboardEvent, action: 'goTo' | 'toggleInfo') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action === 'goTo' ? this.goTo() : this.handleMoreInfoClick();
    }
  }
}
