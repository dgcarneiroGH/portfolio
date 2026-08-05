import { Injectable, inject } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class A11yTitleStrategy extends TitleStrategy {
  private translate = inject(TranslateService);
  private baseTitle = 'Nomacoda | Freelance Frontend Developer';

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const titleKey = snapshot.root.firstChild?.data?.['titleKey'] as
      | string
      | undefined;
    if (titleKey) {
      const sub = this.translate.instant(titleKey);
      document.title = sub ? `${sub} — ${this.baseTitle}` : this.baseTitle;
    } else {
      document.title = this.baseTitle;
    }
  }
}
