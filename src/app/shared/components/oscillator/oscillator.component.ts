import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Tendril } from '../../classes/tendril.class';
import { ITarget, ITendril } from '../../interfaces';

@Component({
  selector: 'app-oscillator',
  standalone: true,
  imports: [],
  template: `
    <canvas
      #oscillatorCanvas
      style="display:block; width:100%; height:100%;"
    ></canvas>
  `,
  styles: `
    :host {
      display: block;
      position: absolute;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
    }
  `
})
export class OscillatorComponent implements AfterViewInit, OnDestroy {
  private _zone = inject(NgZone);

  @Input() initialTargetId?: string;
  @ViewChild('oscillatorCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private _ctx!: CanvasRenderingContext2D;
  private _animationFrameId?: number;
  private _running = false;
  private _oscillatorStartTime = 0;
  private _firstMouseMove = false;
  private _tendrils: ITendril[] = [];
  private _settings = {
    friction: 0.5,
    trails: 20,
    size: 30,
    dampening: 0.25,
    tension: 0.98
  };
  private _target: ITarget = { x: 0, y: 0 };
  private _mouse = { x: 0, y: 0 };
  private _color = this._randomIntFromInterval(1, 2);

  ngAfterViewInit(): void {
    this._ctx = this.canvasRef.nativeElement.getContext('2d')!;

    this._zone.runOutsideAngular(() => {
      this._resizeCanvas();
      this._initOscillator();
      window.addEventListener('resize', this._resizeCanvas);
    });
  }

  ngOnDestroy(): void {
    this._running = false;
    cancelAnimationFrame(this._animationFrameId ?? 0);
    window.removeEventListener('resize', this._resizeCanvas);

    document.removeEventListener('mousemove', this._onFirstMouseMove);
    document.removeEventListener('touchstart', this._onFirstMouseMove);
    document.removeEventListener('mousemove', this._mousemove);
    document.removeEventListener('touchmove', this._mousemove);
    document.removeEventListener('touchstart', this._touchstart);
  }

  private _resizeCanvas = () => {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  private _getInitialTargetCenter(): ITarget {
    if (this.initialTargetId) {
      const el = document.getElementById(this.initialTargetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          rx: rect.width / 3,
          ry: rect.height / 3
        };
      }
    }

    const canvas = this.canvasRef.nativeElement;
    return {
      x: canvas.width / 2,
      y: canvas.height / 2,
      rx: 100,
      ry: 150
    };
  }

  private _initOscillator() {
    this._oscillatorStartTime = Date.now();
    this._firstMouseMove = false;
    this._tendrils = [];
    const initial = this._getInitialTargetCenter();
    this._target = { x: initial.x, y: initial.y };
    for (let i = 0; i < this._settings.trails; i++) {
      this._tendrils.push(
        new Tendril({
          spring: 0.45 + 0.025 * (i / this._settings.trails),
          friction: this._settings.friction,
          size: this._settings.size,
          dampening: this._settings.dampening,
          tension: this._settings.tension,
          target: this._target
        })
      );
    }
    document.addEventListener('mousemove', this._onFirstMouseMove);
    document.addEventListener('touchstart', this._onFirstMouseMove);
    this._running = true;
    this._loop();
  }

  private _onFirstMouseMove = () => {
    this._firstMouseMove = true;
    this._enableMouseListeners();
    document.removeEventListener('mousemove', this._onFirstMouseMove);
    document.removeEventListener('touchstart', this._onFirstMouseMove);
  };

  private _enableMouseListeners() {
    document.addEventListener('mousemove', this._mousemove);
    document.addEventListener('touchmove', this._mousemove);
    document.addEventListener('touchstart', this._touchstart);
  }

  private _mousemove = (event: MouseEvent | TouchEvent) => {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    let x: number, y: number;
    if ('touches' in event && event.touches.length > 0) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else if (event instanceof MouseEvent) {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else {
      return;
    }
    this._mouse.x = x;
    this._mouse.y = y;
    event.preventDefault();
  };

  private _touchstart = (event: TouchEvent) => {
    if (event.touches.length == 1) {
      this._target.x = event.touches[0].pageX;
      this._target.y = event.touches[0].pageY;
    }
  };

  private _loop = () => {
    if (!this._running) return;

    const ctx = this._ctx;
    ctx.globalCompositeOperation = 'source-over';
    const angle = (60 * Math.PI) / 180,
      x2 = 2700 * Math.cos(angle),
      y2 = 50 * Math.sin(angle);
    const gradient = ctx.createLinearGradient(0, 0, x2, y2);
    gradient.addColorStop(0, '#0f3254');
    gradient.addColorStop(1, '#115f51');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 2;

    ctx.strokeStyle =
      this._color == 1
        ? 'hsla(32, 100%, 57%, 0.5)'
        : 'hsla(199, 92%, 56%, 0.5)';

    // Animate _target until user move the _mouse
    if (!this._firstMouseMove) {
      const elapsed = Date.now() - this._oscillatorStartTime;
      const initial = this._getInitialTargetCenter();
      const theta = Math.PI + (elapsed / 5000) * 2 * Math.PI;
      this._target.x = initial.x + initial.rx! * Math.cos(theta);
      this._target.y = initial.y + initial.ry! * Math.sin(theta);
    } else {
      // Smoothing towards mouse position
      this._target.x += (this._mouse.x - this._target.x) * 0.2;
      this._target.y += (this._mouse.y - this._target.y) * 0.2;
    }
    for (let i = 0; i < this._settings.trails; i++) {
      const tendril = this._tendrils[i];
      tendril.update!(this._target);
      tendril.draw!(ctx);
    }
    this._animationFrameId = requestAnimationFrame(this._loop);
  };

  private _randomIntFromInterval(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
