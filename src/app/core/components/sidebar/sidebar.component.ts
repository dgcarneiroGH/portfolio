import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SOCIAL_MEDIA_PROFILES } from '../../constants/sidebar.constants';
import { SocialMediaLinks } from '../../interfaces/sidebar.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  readonly links: readonly SocialMediaLinks[] = SOCIAL_MEDIA_PROFILES;
  readonly open = signal(true);

  toggle(): void {
    this.open.set(!this.open());
  }
}