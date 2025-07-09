import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LangSelectorComponent } from './core/components/lang-selector/lang-selector.component';
import { SectionsWrapperComponent } from './core/components/sections-wrapper/sections-wrapper.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    SectionsWrapperComponent,
    CommonModule,
    LangSelectorComponent,
    TranslateModule
  ],
  animations: []
})
export class AppComponent {}
