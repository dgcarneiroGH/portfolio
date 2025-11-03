import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LangSelectorComponent } from './core/components/lang-selector/lang-selector.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    RouterOutlet,
    LangSelectorComponent,
    TranslateModule
  ],
  animations: []
})
export class AppComponent {}
