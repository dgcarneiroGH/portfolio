import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OscillatorComponent } from 'src/app/shared/components/oscillator/oscillator.component';
import { AnimateDirective } from 'src/app/shared/directives/animate.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [TranslateModule, AnimateDirective, OscillatorComponent]
})
export class HomeComponent {}
