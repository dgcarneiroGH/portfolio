import { INode, ITarget } from '.';

export interface ITendril {
  spring: number;
  friction: number;
  nodes?: INode[];
  dampening: number;
  tension: number;
  size: number;
  target?: ITarget;
  update?: (target: ITarget) => void;
  draw?: (ctx: CanvasRenderingContext2D) => void;
}
