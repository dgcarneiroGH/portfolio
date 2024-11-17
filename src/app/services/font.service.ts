import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { FONT_URLS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class FontService {
  fonts = FONT_URLS;

  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  loadFonts() {
    this.fonts.forEach((f) => this.loadFont(f));
  }

  private loadFont(url: string) {
    const link = this.renderer.createElement('link');
    this.renderer.setAttribute(link, 'rel', 'stylesheet');
    this.renderer.setAttribute(link, 'href', url);
    document.head.appendChild(link);
  }
}
