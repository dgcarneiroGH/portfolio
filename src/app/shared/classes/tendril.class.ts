import { INode, ITarget, ITendril } from '../interfaces';

export class Tendril {
  spring: number;
  friction: number;
  nodes: INode[] = [];
  dampening: number;
  tension: number;
  size: number;
  target?: ITarget;

  constructor(options: ITendril) {
    this.spring = options.spring;
    this.friction = options.friction;
    this.dampening = options.dampening;
    this.tension = options.tension;
    this.size = options.size;
    for (let i = 0; i < this.size; i++) {
      this.nodes.push({
        x: options.target!.x,
        y: options.target!.y,
        vx: 0,
        vy: 0
      });
    }
  }

  update(target: { x: number; y: number }) {
    let spring = this.spring;
    let node = this.nodes[0];
    node.vx += (target.x - node.x) * spring;
    node.vy += (target.y - node.y) * spring;
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

  draw(ctx: CanvasRenderingContext2D) {
    let x = this.nodes[0].x,
      y = this.nodes[0].y,
      a,
      b;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 1, n = this.nodes.length - 2; i < n; i++) {
      a = this.nodes[i];
      b = this.nodes[i + 1];
      x = (a.x + b.x) * 0.5;
      y = (a.y + b.y) * 0.5;
      ctx.quadraticCurveTo(a.x, a.y, x, y);
    }
    a = this.nodes[this.nodes.length - 2];
    b = this.nodes[this.nodes.length - 1];
    ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
    ctx.stroke();
    ctx.closePath();
  }
}
