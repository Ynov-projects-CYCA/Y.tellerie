import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-shell.component.html',
})
export class AuthShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly compact = input(false);
}
