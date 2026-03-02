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

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleOptions();
        break;
      case 'Escape':
        this.closeOptions();
        break;
      case 'ArrowDown':
        if (!this.showOptions()) {
          event.preventDefault();
          this.showOptions.set(true);
        }
        break;
      case 'ArrowUp':
        if (this.showOptions()) {
          event.preventDefault();
          this.closeOptions();
        }
        break;
    }
  }

  onLanguageKeyDown(event: KeyboardEvent, langId: string): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectLanguage(langId);
        break;
      case 'Escape':
        this.closeOptions();
        // Focus back to trigger button
        const triggerButton = event.target as HTMLElement;
        const container = triggerButton.closest('.lang-selector-container');
        const button = container?.querySelector('button');
        button?.focus();
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.navigateOptions(
          event.key === 'ArrowDown' ? 1 : -1,
          event.target as HTMLElement
        );
        break;
    }
  }

  private navigateOptions(
    direction: number,
    currentElement: HTMLElement
  ): void {
    const options = Array.from(
      currentElement.closest('ul')?.querySelectorAll('li') || []
    );
    const currentLi = currentElement.closest('li') as HTMLLIElement;
    const currentIndex = options.indexOf(currentLi);
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < options.length) {
      (options[nextIndex] as HTMLElement).focus();
    }
  }
}
