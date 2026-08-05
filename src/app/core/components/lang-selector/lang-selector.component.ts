import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, computed, viewChild } from '@angular/core';
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

  private _optionsList = viewChild<ElementRef<HTMLUListElement>>('langOptions');
  private _triggerButton = viewChild<ElementRef<HTMLButtonElement>>('triggerBtn');

  toggleOptions(): void {
    this.showOptions.set(!this.showOptions());
  }

  closeOptions(): void {
    this.showOptions.set(false);
  }

  selectLanguage(lang: string): void {
    this._langService.setLanguage(lang);
    this.closeOptions();
    // Restore focus to the trigger after selection (WCAG 2.4.3)
    this._triggerButton()?.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleOptions();
        if (this.showOptions()) {
          queueMicrotask(() => this._focusOption(0));
        }
        break;
      case 'Escape':
        this.closeOptions();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.showOptions()) {
          this.showOptions.set(true);
          queueMicrotask(() => this._focusOption(0));
        }
        break;
      case 'ArrowUp':
        if (this.showOptions()) {
          event.preventDefault();
          this.closeOptions();
        }
        break;
      case 'Home':
        if (this.showOptions()) { event.preventDefault(); this._focusOption(0); }
        break;
      case 'End':
        if (this.showOptions()) { event.preventDefault(); this._focusOption(this.filteredLanguages().length - 1); }
        break;
      default: {
        // TypeAhead: jump to first option whose label starts with the typed character.
        if (this.showOptions() && event.key.length === 1 && /\S/.test(event.key)) {
          const ch = event.key.toLowerCase();
          const idx = this.filteredLanguages().findIndex(l => l.label.toLowerCase().startsWith(ch));
          if (idx >= 0) { event.preventDefault(); this._focusOption(idx); }
        }
      }
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
        this._triggerButton()?.nativeElement.focus();
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

  private _focusOption(index: number): void {
    const options = this._optionsList()?.nativeElement.querySelectorAll<HTMLLIElement>('li.lang');
    options?.[index]?.focus();
  }
}
