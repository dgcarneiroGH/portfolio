import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PhotoComponent } from '../../../shared/components/photo/photo.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PhotoComponent, TranslateModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {}
