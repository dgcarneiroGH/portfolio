import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LANGUAGES } from '../../constants/lang.constants';
import { LangService } from '../../services/lang.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';

@Component({
  selector: 'app-lang-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, ClickOutsideDirective],
  templateUrl: './lang-selector.component.html',
  styleUrl: './lang-selector.component.scss'
})
export class LangSelectorComponent {
  private _langService = inject(LangService);

  showOptions = signal(false);

  currentLanguage = computed(() =>
    LANGUAGES.find(({ id }) => id === this._langService.currentLanguage())
  );

  filteredLanguages = computed(() =>
    LANGUAGES.filter(({ id }) => id !== this.currentLanguage()?.id)
  );

  toggleOptions(): void {
    this.showOptions.set(!this.showOptions());
  }

  closeOptions(): void {
    this.showOptions.set(false);
  }

  selectLanguage(lang: string): void {
    this._langService.setLanguage(lang);
    this.closeOptions();
  }
}
