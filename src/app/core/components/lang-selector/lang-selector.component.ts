import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-lang-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './lang-selector.component.html',
  styleUrl: './lang-selector.component.scss'
})
export class LangSelectorComponent {
  private _langService = inject(LangService);

  public showOptions = false;

  languages = [
    { code: 'es', label: '🇪🇸 Español' },
    { code: 'en', label: '🇺🇸 English' }
  ];

  changeLanguage(lang: string) {
    this._langService.setLanguage(lang);
  }

  get currentLanguage() {
    console.log(this._langService.getLanguage());
    return this._langService.getLanguage();
  }
}
