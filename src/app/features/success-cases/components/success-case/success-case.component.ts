import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TechPillComponent } from '../tech-pill/tech-pill.component';
import { SUCCESS_CASE_PALETTES } from '../../constants/success-case-palettes';
import { SuccessCase } from '../../interfaces/success-case.interface';

@Component({
  selector: 'app-success-case',
  standalone: true,
  imports: [TechPillComponent, TranslateModule],
  templateUrl: './success-case.component.html',
  styleUrl: './success-case.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessCaseComponent {
  successCase = input.required<SuccessCase>();
  index = input.required<number>();

  openRequest = output<number>();

  gradient = computed(() => {
    const palette = SUCCESS_CASE_PALETTES[this.successCase().coverImgSrc];
    if (!palette || palette.length <= 1) {
      return 'linear-gradient(135deg, #0f3254, #115f51)';
    }
    return `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`;
  });
}
