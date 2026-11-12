import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SuccessCaseComponent } from '../success-case/success-case.component';
import { SuccessCaseDetailComponent } from '../success-case-detail/success-case-detail.component';
import { SUCCESS_CASES } from '../../constants/success-cases.constants';
import { SuccessCase } from '../../interfaces/success-case.interface';

@Component({
  selector: 'app-success-cases',
  standalone: true,
  imports: [SuccessCaseComponent, SuccessCaseDetailComponent, TranslateModule],
  templateUrl: './success-cases.component.html',
  styleUrl: './success-cases.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessCasesComponent {
  private _cases = signal<SuccessCase[]>(SUCCESS_CASES);
  private _openIndex = signal<number | null>(null);

  cases = this._cases.asReadonly();

  openCase = computed<SuccessCase | null>(() => {
    const index = this._openIndex();
    return index === null ? null : this._cases()[index];
  });

  // El detalle es un overlay fijo de un one-pager compartido por varias rutas:
  // al cambiar de ruta se cierra para no tapar la nueva sección (auditoría responsive M4).
  constructor() {
    inject(Router)
      .events.pipe(
        takeUntilDestroyed(),
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.onClose();
      });
  }

  onOpenRequest(index: number): void {
    this._openIndex.set(index);
  }

  onClose(): void {
    this._openIndex.set(null);
  }
}
