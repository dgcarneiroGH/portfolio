import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicScriptService } from 'src/app/core/services/dynamic-script.service';
import { AnimateDirective } from 'src/app/shared/directives/animate.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [TranslateModule, AnimateDirective]
})
export class HomeComponent implements OnInit, OnDestroy {
  private dsService = inject(DynamicScriptService);

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  screenHeight!: number;
  screenWidth!: number;

  public animationDelay = 3300;

  ngOnInit(): void {
    this.getScreenSize();

    if (this.screenWidth > 768) {
      this.dsService
        .load('oscillator')
        .then(() => {
          this.oscillate(false);
        })
        .catch((error) => console.log(error));
    }
  }

  oscillate(value: boolean) {
    (window as any).initOscillator(value);
  }

  ngOnDestroy(): void {
    // Remove all the event listeners oscillating in background.
    if (typeof (window as any).initOscillator !== 'undefined') {
      this.oscillate(true);
    }
  }
}
