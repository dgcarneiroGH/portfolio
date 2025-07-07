import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';

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
  styles: `:host { display: block; position: absolute; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 0; }`
})
export class OscillatorComponent implements AfterViewInit, OnDestroy {
  @Input() initialTargetId?: string;

  @ViewChild('oscillatorCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  private _ctx!: CanvasRenderingContext2D;
  private _animationFrameId: any;
  private _running = false;
  private _oscillatorStartTime = 0;
  private _firstMouseMove = false;
  private _tendrils: any[] = [];
  private _settings = {
    friction: 0.5,
    trails: 20,
    size: 30,
    dampening: 0.25,
    tension: 0.98
  };
  private _target = { x: 0, y: 0 };
  private _mouse = { x: 0, y: 0 };
  private _color = this._randomIntFromInterval(1, 2);

  ngAfterViewInit(): void {
    this._ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this._resizeCanvas();
    this.initOscillator();
    window.addEventListener('resize', this._resizeCanvas);
  }

  ngOnDestroy(): void {
    this._running = false;
    cancelAnimationFrame(this._animationFrameId);
    window.removeEventListener('resize', this._resizeCanvas);
    document.removeEventListener('mousemove', this.onFirstMouseMove);
    document.removeEventListener('touchstart', this.onFirstMouseMove);
    document.removeEventListener('mousemove', this.mousemove);
    document.removeEventListener('touchmove', this.mousemove);
    document.removeEventListener('touchstart', this.touchstart);
  }

  private _resizeCanvas = () => {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  private _getInitialTargetCenter(): {
    x: number;
    y: number;
    rx: number;
    ry: number;
  } {
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

  private initOscillator() {
    this._oscillatorStartTime = Date.now();
    this._firstMouseMove = false;
    this._tendrils = [];
    const initial = this._getInitialTargetCenter();
    this._target = { x: initial.x, y: initial.y };
    for (let i = 0; i < this._settings.trails; i++) {
      this._tendrils.push(
        new this.Tendril({
          spring: 0.45 + 0.025 * (i / this._settings.trails),
          friction: this._settings.friction,
          size: this._settings.size,
          dampening: this._settings.dampening,
          tension: this._settings.tension,
          _target: this._target
        })
      );
    }
    document.addEventListener('mousemove', this.onFirstMouseMove);
    document.addEventListener('touchstart', this.onFirstMouseMove);
    this._running = true;
    this.loop();
  }

  private onFirstMouseMove = (e: MouseEvent | TouchEvent) => {
    this._firstMouseMove = true;
    this.enableMouseListeners();
    document.removeEventListener('mousemove', this.onFirstMouseMove);
    document.removeEventListener('touchstart', this.onFirstMouseMove);
  };

  private enableMouseListeners() {
    document.addEventListener('mousemove', this.mousemove);
    document.addEventListener('touchmove', this.mousemove);
    document.addEventListener('touchstart', this.touchstart);
  }

  private mousemove = (event: MouseEvent | any) => {
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

  private touchstart = (event: TouchEvent) => {
    if (event.touches.length == 1) {
      this._target.x = event.touches[0].pageX;
      this._target.y = event.touches[0].pageY;
    }
  };

  private loop = () => {
    if (!this._running) return;
    const _ctx = this._ctx;
    _ctx.globalCompositeOperation = 'source-over';
    const angle = (60 * Math.PI) / 180,
      x2 = 2700 * Math.cos(angle),
      y2 = 50 * Math.sin(angle);
    const gradient = _ctx.createLinearGradient(0, 0, x2, y2);
    gradient.addColorStop(0, '#0f3254');
    gradient.addColorStop(1, '#115f51');
    _ctx.fillStyle = gradient;
    _ctx.fillRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    _ctx.globalCompositeOperation = 'lighter';
    _ctx.lineWidth = 2;

    _ctx.strokeStyle =
      this._color == 1
        ? 'hsla(32, 100%, 57%, 0.5)'
        : 'hsla(199, 92%, 56%, 0.5)';

    // Animate _target until user move the _mouse
    if (!this._firstMouseMove) {
      const elapsed = Date.now() - this._oscillatorStartTime;
      const initial = this._getInitialTargetCenter();
      const theta = Math.PI + (elapsed / 5000) * 2 * Math.PI;
      this._target.x = initial.x + initial.rx * Math.cos(theta);
      this._target.y = initial.y + initial.ry * Math.sin(theta);
    } else {
      // Smoothing towards mouse position
      this._target.x += (this._mouse.x - this._target.x) * 0.2;
      this._target.y += (this._mouse.y - this._target.y) * 0.2;
    }
    for (let i = 0; i < this._settings.trails; i++) {
      const tendril = this._tendrils[i];
      tendril.update(this._target);
      tendril.draw(_ctx);
    }
    this._animationFrameId = requestAnimationFrame(this.loop);
  };

  private _randomIntFromInterval(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private Tendril = class {
    spring: number;
    friction: number;
    nodes: any[] = [];
    dampening: number;
    tension: number;
    size: number;
    constructor(options: any) {
      this.spring = options.spring;
      this.friction = options.friction;
      this.dampening = options.dampening;
      this.tension = options.tension;
      this.size = options.size;
      for (let i = 0; i < this.size; i++) {
        this.nodes.push({
          x: options._target.x,
          y: options._target.y,
          vx: 0,
          vy: 0
        });
      }
    }

    update(_target: { x: number; y: number }) {
      let spring = this.spring;
      let node = this.nodes[0];
      node.vx += (_target.x - node.x) * spring;
      node.vy += (_target.y - node.y) * spring;
      for (let i = 0, n = this.nodes.length; i < n; i++) {
        node = this.nodes[i];
        if (i > 0) {
          const prev = this.nodes[i - 1];
          node.vx += (prev.x - node.x) * spring;
          node.vy += (prev.y - node.y) * spring;
          node.vx += prev.vx * this.dampening;
          node.vy += prev.vy * this.dampening;
        }
        node.vx *= this.friction;
        node.vy *= this.friction;
        node.x += node.vx;
        node.y += node.vy;
        spring *= this.tension;
      }
    }

    draw(_ctx: CanvasRenderingContext2D) {
      let x = this.nodes[0].x,
        y = this.nodes[0].y,
        a,
        b;
      _ctx.beginPath();
      _ctx.moveTo(x, y);
      for (let i = 1, n = this.nodes.length - 2; i < n; i++) {
        a = this.nodes[i];
        b = this.nodes[i + 1];
        x = (a.x + b.x) * 0.5;
        y = (a.y + b.y) * 0.5;
        _ctx.quadraticCurveTo(a.x, a.y, x, y);
      }
      a = this.nodes[this.nodes.length - 2];
      b = this.nodes[this.nodes.length - 1];
      _ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
      _ctx.stroke();
      _ctx.closePath();
    }
  };
}
