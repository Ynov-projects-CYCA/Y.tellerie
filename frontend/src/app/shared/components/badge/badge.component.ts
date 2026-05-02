import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./badge.component.html`,
  styleUrl: './badge.component.scss',
  host: {
    '[attr.variant]': 'variant()',
  }
})
export class BadgeComponent {
  variant = input<'success' | 'warning' | 'danger' | 'info' | 'neutral'>('neutral');
}
