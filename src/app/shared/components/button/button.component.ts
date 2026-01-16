import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  color = input('transparent');
  disabled = input(false);
  text = input('');

  buttonClick = output<void>();

  cssColor = computed(() => {
    const value = this.color();
    if (value.startsWith('#')) return this._hexToRgb(value);
    return value;
  });

  onClick(): void {
    if (this.disabled()) return;

    this.buttonClick.emit();
  }

  private _hexToRgb(hex: string): string {
    let cleanHex = hex.replace('#', '');

    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split('')
        .map((c) => c + c)
        .join('');
    }

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  }
}
