import { Component, OnInit } from '@angular/core';
import { SOCIAL_MEDIA_PROFILES } from '../../constants/sidebar.constants';
import { SocialMediaLinks } from '../../interfaces/sidebar.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public currentYear!: number;
  public links!: SocialMediaLinks[];

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.links = SOCIAL_MEDIA_PROFILES;
  }
}
