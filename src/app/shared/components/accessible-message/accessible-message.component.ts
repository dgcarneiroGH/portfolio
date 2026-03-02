import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-accessible-message',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div
      class="accessible-message"
      [ngClass]="'accessible-' + type()"
      [attr.role]="getRole()"
      [attr.aria-live]="live() ? 'polite' : null"
    >
      <span class="icon" [attr.aria-hidden]="true">{{ getIcon() }}</span>
      <span class="message">
        <ng-content></ng-content>
      </span>
    </div>
  `,
  styleUrl: './accessible-message.component.scss'
})
export class AccessibleMessageComponent {
  type = input.required<MessageType>();
  live = input<boolean>(false);

  getIcon(): string {
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[this.type()];
  }

  getRole(): string {
    return this.type() === 'error' ? 'alert' : 'status';
  }
}
