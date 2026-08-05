import { Directive } from '@angular/core';

/**
 * @deprecated Use native <button> or <a> elements instead.
 * This directive will be removed in a future release (WCAG 4.1.2).
 */
@Directive({
  selector: '[appFocusable]',
  standalone: true
})
export class FocusableDirective {
  // No-op: replaced by native interactive elements throughout the codebase.
}
