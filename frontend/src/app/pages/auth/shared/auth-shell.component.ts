import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink],
  templateUrl: './auth-shell.component.html',
})
export class AuthShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly compact = input(false);
  readonly badgeText = input('YT');
  readonly topActionLabel = input('Retour a l accueil');
  readonly topActionLink = input('/');
}
