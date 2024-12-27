import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavMenuItems } from '../../../constants';
import { INavMenuItems } from '../../../interfaces';
import { ToggleNavMenuDirective } from '../../../directives/toggle-nav-menu.directive';

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ToggleNavMenuDirective],
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.scss']
})
export class NavigationMenuComponent {
  navMenuItems: INavMenuItems[] = NavMenuItems;
}
