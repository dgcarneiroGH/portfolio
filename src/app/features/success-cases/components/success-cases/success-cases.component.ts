import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal
} from '@angular/core';
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

  onOpenRequest(index: number): void {
    this._openIndex.set(index);
  }

  onClose(): void {
    this._openIndex.set(null);
  }
}
