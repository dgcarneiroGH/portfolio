import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
// TODO:Pending to check the state of this functionality for accessibility
@Component({
  selector: 'app-skip-links',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="skip-links">
      <a href="#main-content" class="skip-link">
        {{ 'COMMON.SKIP_TO_MAIN' | translate }}
      </a>
      <a href="#navigation" class="skip-link">
        {{ 'COMMON.SKIP_TO_NAV' | translate }}
      </a>
    </div>
  `,
  styleUrl: './skip-links.component.scss'
})
export class SkipLinksComponent {}
