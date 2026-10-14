import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  input,
  output,
  viewChild
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SUCCESS_CASE_PALETTES } from '../../constants/success-case-palettes';
import { SuccessCase } from '../../interfaces/success-case.interface';
import { TechPillComponent } from '../tech-pill/tech-pill.component';

@Component({
  selector: 'app-success-case-detail',
  standalone: true,
  imports: [TechPillComponent, TranslateModule],
  templateUrl: './success-case-detail.component.html',
  styleUrl: './success-case-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()'
  }
})
export class SuccessCaseDetailComponent implements OnInit, OnDestroy {
  successCase = input.required<SuccessCase>();

  closed = output<void>();

  private _panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  gradient = computed(() => {
    const palette = SUCCESS_CASE_PALETTES[this.successCase().coverImgSrc];
    if (!palette || palette.length <= 1) {
      return 'linear-gradient(135deg, #0f3254, #115f51)';
    }
    return `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`;
  });

  constructor() {
    effect(() => {
      this._panel()?.nativeElement.focus();
    });
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  onEscape(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }
}
