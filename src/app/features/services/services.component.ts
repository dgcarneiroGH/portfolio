import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SERVICES } from './constants/services.constants';
import { Service } from './interfaces/service.interface';

@Component({
  selector: 'app-services',
  standalone: true,
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  imports: [RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent {
  readonly services: Service[] = SERVICES;
}
