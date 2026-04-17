import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthAccountService } from '../../../core/auth/auth-account.service';
import { AuthRedirectService } from '../../../core/auth/auth-redirect.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private readonly authAccountService = inject(AuthAccountService);
  private readonly authRedirectService = inject(AuthRedirectService);
  protected readonly authSessionService = inject(AuthSessionService);

  isScrolled = false;
  isMobileMenuOpen = false;
  protected readonly isLoggingOut = signal(false);
  protected readonly currentUser = computed(() => this.authSessionService.currentUser());
  protected readonly dashboardLink = computed(() => {
    const user = this.currentUser();
    return user ? this.authRedirectService.getPostAuthUrl(user) : null;
  });

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

    this.isLoggingOut.set(true);

    this.authAccountService
      .logout()
      .pipe(
        finalize(() => this.isLoggingOut.set(false)),
      )
      .subscribe();
  }
}
