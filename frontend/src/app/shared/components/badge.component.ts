import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1;
      width: fit-content;
    }

    :host([variant="success"]) { background-color: #ecfdf5; color: #059669; }
    :host([variant="warning"]) { background-color: #fffbeb; color: #d97706; }
    :host([variant="danger"]) { background-color: #fef2f2; color: #dc2626; }
    :host([variant="info"]) { background-color: #eff6ff; color: #2563eb; }
    :host([variant="neutral"]) { background-color: #f5f5f4; color: #57534e; }
  `],
  host: {
    '[attr.variant]': 'variant()',
  }
})
export class BadgeComponent {
  variant = input<'success' | 'warning' | 'danger' | 'info' | 'neutral'>('neutral');
}
