import { Component, signal, computed, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SOCIAL_MEDIA_PROFILES } from '../../constants/sidebar.constants';
import { SocialMediaLinks } from '../../interfaces/sidebar.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [TranslateModule]
})
export class SidebarComponent {
  private _currentYear = signal<number>(new Date().getFullYear());
  private _links = signal<SocialMediaLinks[]>(SOCIAL_MEDIA_PROFILES);

  currentYear = this._currentYear.asReadonly();
  links = this._links.asReadonly();

  footerText = computed(() => `© ${this.currentYear()} - Portfolio`);
}
