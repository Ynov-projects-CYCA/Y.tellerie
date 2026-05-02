import { Component, input } from '@angular/core';

@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  templateUrl: `./button.component.html`,
  styleUrl: './button.component.scss',
  host: {
    '[attr.variant]': 'variant()',
    '[attr.size]': 'size()',
  }
})
export class ButtonComponent {
  variant = input<'primary' | 'outline' | 'ghost' | 'white' | 'white-outline'>('primary');
  size = input<'default' | 'sm' | 'lg' | 'full'>('default');
}
