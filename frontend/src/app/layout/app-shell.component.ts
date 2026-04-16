import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from '../core/auth/auth-session.service';
import { APP_ENVIRONMENT } from '../core/config/app-environment';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  protected readonly environment = inject(APP_ENVIRONMENT);
  protected readonly authSessionService = inject(AuthSessionService);
}
