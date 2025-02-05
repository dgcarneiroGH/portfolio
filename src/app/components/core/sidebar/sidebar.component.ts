import { Component, OnInit } from '@angular/core';
import { SocialMediaProfiles } from '../../../constants';
import { ISocialMediaLinks } from '../../../interfaces';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public currentYear!: number;
  public links!: ISocialMediaLinks[];

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.links = SocialMediaProfiles;
  }
}
