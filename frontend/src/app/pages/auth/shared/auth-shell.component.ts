import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-shell',
  templateUrl: './auth-shell.component.html',
})
export class AuthShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly compact = input(false);
}
