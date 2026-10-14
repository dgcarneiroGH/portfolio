import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CodeWindowComponent } from './code-window/code-window.component';
import { SkillsComponent } from './skills/skills.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [TranslateModule, RouterLink, SkillsComponent, CodeWindowComponent]
})
export class HomeComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    // TODO: Esto puede que no sea necesario
    window.scrollTo(0, 0);
  }
}
