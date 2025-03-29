import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LangService } from 'src/app/services/lang.service';
import { ToggleButtonComponent } from '../../shared/toggle-button/toggle-button.component';

@Component({
  selector: 'app-lang-selector',
  standalone: true,
  imports: [ToggleButtonComponent, CommonModule],
  templateUrl: './lang-selector.component.html',
  styleUrl: './lang-selector.component.scss'
})
export class LangSelectorComponent {
  languages = [
    { code: 'es', label: '🇪🇸 Español' },
    { code: 'en', label: '🇺🇸 English' }
  ];

  constructor(private langService: LangService) {}

  changeLanguage(lang: string) {
    this.langService.setLanguage(lang);
  }

  get currentLanguage() {
    return this.langService.getLanguage();
  }
}
