import { Component, HostListener, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { ButtonComponent } from '../../../shared/components/button.component';
import {
  LucideHotel,
  LucideMenu,
  LucideX,
  LucideUser,
  LucideChevronDown,
  LucideLogOut,
  LucideHistory,
  LucideCalendar,
  LucideBed,
  LucideShield,
  LucideHome,
} from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideHotel,
    LucideMenu,
    LucideX,
    LucideUser,
    LucideChevronDown,
    LucideLogOut,
    LucideHistory,
    LucideCalendar,
    LucideBed,
    LucideShield,
    LucideHome,
    ButtonComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private readonly authApiService = inject(AuthApiService);
  protected readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);
  protected readonly isLoggingOut = signal(false);

  isScrolled = false;
  isMobileMenuOpen = false;
  isProfileMenuOpen = false;

  currentMode = signal<'public' | 'customer' | 'staff'>('public');

  // Données Staff (selon votre snippet)
  currentUser = signal({
    name: 'Jean Dupont',
    role: 'Réceptionniste',
    isAdmin: true,
    email: 'jean.dupont@ytellerie.com',
    phone: '+33 6 12 34 56 78',
    shift: '08:00 - 16:00'
  });

  // Données Client (selon votre snippet)
  currentClient = signal({
    name: 'Marie Martin',
    email: 'marie.martin@email.com',
    phone: '+33 6 98 76 54 32',
    address: '45 Avenue des Champs-Élysées, 75008 Paris',
    joinDate: '2023-05-20'
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
    this.updateMode(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateMode(event.urlAfterRedirects);
      this.isMobileMenuOpen = false;
      this.isProfileMenuOpen = false;
    });
  }

  private updateMode(url: string) {
    if (url.startsWith('/staff')) {
      this.currentMode.set('staff');
    } else if (url.startsWith('/customer')) {
      this.currentMode.set('customer');
    } else {
      this.currentMode.set('public');
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  scrollTo(anchor: string): void {
    if (this.currentMode() !== 'public') {
      this.router.navigate(['/'], { fragment: anchor.replace('#', '') });
      return;
    }
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
