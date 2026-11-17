import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SuccessCaseComponent } from '../success-case/success-case.component';
import { SUCCESS_CASES } from '../../constants/success-cases.constants';
import { SuccessCase } from '../../interfaces/success-case.interface';

// Umbral en px a partir del cual un gesto de puntero se considera swipe.
const SWIPE_THRESHOLD = 50;

@Component({
  selector: 'app-success-cases',
  standalone: true,
  imports: [SuccessCaseComponent, TranslateModule],
  templateUrl: './success-cases.component.html',
  styleUrl: './success-cases.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessCasesComponent {
  private _cases = signal<SuccessCase[]>(SUCCESS_CASES);
  private _activeIndex = signal(0);
  private _pointerStartX: number | null = null;

  cases = this._cases.asReadonly();
  activeIndex = this._activeIndex.asReadonly();

  trackTransform = computed(
    () => `translateX(-${this._activeIndex() * 100}%)`
  );

  activeCase = computed<SuccessCase>(
    () => this._cases()[this._activeIndex()]
  );

  next(): void {
    const total = this._cases().length;
    this._activeIndex.set((this._activeIndex() + 1) % total);
  }

  prev(): void {
    const total = this._cases().length;
    this._activeIndex.set((this._activeIndex() - 1 + total) % total);
  }

  goTo(index: number): void {
    this._activeIndex.set(index);
  }

  onPointerDown(event: PointerEvent): void {
    this._pointerStartX = event.clientX;
  }

  onPointerUp(event: PointerEvent): void {
    if (this._pointerStartX === null) return;
    const delta = event.clientX - this._pointerStartX;
    this._pointerStartX = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) {
      this.next();
    } else {
      this.prev();
    }
  }

  onPointerCancel(): void {
    this._pointerStartX = null;
  }
}
