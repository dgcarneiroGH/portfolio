import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { AnimateComponent } from '../animate/animate.component';
import { DynamicScriptService } from '../../services/dynamic-script.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent
  extends AnimateComponent
  implements OnInit, OnDestroy
{
  override animationDelay: number = 3300;
  screenHeight!: number;
  screenWidth!: number;

  private dsService = inject(DynamicScriptService);

  constructor() {
    super();
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
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
