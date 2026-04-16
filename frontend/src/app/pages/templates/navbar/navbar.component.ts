import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private readonly authApiService = inject(AuthApiService);
  protected readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  isScrolled = false;
  isMobileMenuOpen = false;
  protected readonly isLoggingOut = signal(false);

  navLinks = [
    { label: 'Fonctionnalités', anchor: '#features' },
    { label: 'Avantages', anchor: '#benefits' },
    { label: 'Contact', anchor: '#contact' },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  ngOnInit(): void {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  scrollTo(anchor: string): void {
    this.closeMobileMenu();
    const el = document.querySelector(anchor);
    el?.scrollIntoView({ behavior: 'smooth' });
  }

  protected logout(): void {
    this.closeMobileMenu();

    const session = this.authSessionService.currentSession();
    if (!session) {
      this.authSessionService.clearSession();
      void this.router.navigateByUrl('/connexion');
      return;
    }

    this.isLoggingOut.set(true);

    this.authApiService
      .logout(session.refreshToken)
      .pipe(
        finalize(() => {
          this.isLoggingOut.set(false);
          this.authSessionService.clearSession();
          void this.router.navigateByUrl('/connexion');
        }),
      )
      .subscribe({
        error: () => undefined,
      });
  }
}
