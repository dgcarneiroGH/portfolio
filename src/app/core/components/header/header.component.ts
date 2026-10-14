import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LangSelectorComponent } from '../lang-selector/lang-selector.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LangSelectorComponent, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  //Modifica esta variable para determinar si estás o no disponible
  isAvailable = input(true);

  statusKey = computed(() =>
    this.isAvailable() ? 'HEADER.STATUS_AVAILABLE' : 'HEADER.STATUS_UNAVAILABLE'
  );
}