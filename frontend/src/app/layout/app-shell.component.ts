import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent, NavbarComponent } from '@pages/templates';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {}
