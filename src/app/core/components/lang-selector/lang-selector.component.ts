import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClickOutsideDirective } from 'src/app/shared/directives/click-outside.directive';
import { LANGUAGES } from '../../constants/lang.constants';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-lang-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, ClickOutsideDirective],
  templateUrl: './lang-selector.component.html',
  styleUrl: './lang-selector.component.scss'
})
export class LangSelectorComponent {
  private _langService = inject(LangService);

  public showOptions = false;

  get currentLanguage() {
    return LANGUAGES.find(({ id }) => id === this._langService.getLanguage());
  }

  get filteredLanguages() {
    return LANGUAGES.filter(({ id }) => id !== this.currentLanguage?.id);
  }

  selectLanguage(lang: string) {
    this._langService.setLanguage(lang);
  }
}
