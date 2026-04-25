import { Component, HostListener, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { finalize, filter } from 'rxjs';
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
  LucideHouse,
} from '@lucide/angular';
import {ButtonComponent} from '../../../shared/components/button.component';
import {AuthApiService} from '../../../core/auth/auth-api.service';
import {AuthSessionService} from '../../../core/auth/auth-session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    LucideHotel,
    LucideMenu,
    LucideX,
    LucideUser,
    LucideChevronDown,
    LucideLogOut,
    LucideHistory,
    LucideCalendar,
    LucideBed,
    LucideHouse
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private readonly authApiService = inject(AuthApiService);
  protected readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  protected readonly isLoggingOut = signal(false);
  protected isScrolled = false;
  protected isMobileMenuOpen = false;
  protected isProfileMenuOpen = false;

  private readonly currentUrl = signal(this.router.url);

  protected readonly currentUser = computed(() => this.authSessionService.currentUser());
  protected readonly isHomePage = computed(() => this.currentUrl() === '/');

  /**
   * Détermine le mode d'affichage de la navigation selon le rôle.
   */
  protected readonly currentMode = computed<'public' | 'client' | 'staff'>(() => {
    const user = this.currentUser();
    if (!user) return 'public';
    return user.roles.includes('personnel') ? 'staff' : 'client';
  });

  protected readonly navLinks = [
    { label: 'Fonctionnalités', anchor: '#features' },
    { label: 'Avantages', anchor: '#benefits' },
    { label: 'Contact', anchor: '#contact' },
  ];

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    this.isProfileMenuOpen = false;
  }

  public ngOnInit(): void {
    this.isScrolled = window.scrollY > 20;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects);
      this.isMobileMenuOpen = false;
      this.isProfileMenuOpen = false;
    });
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  protected toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  protected scrollTo(anchor: string): void {
    if (this.currentMode() !== 'public') {
      this.router.navigate(['/'], { fragment: anchor.replace('#', '') });
      return;
    }
    this.closeMobileMenu();
    document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' });
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
    this.authApiService.logout(session.refreshToken).pipe(
      finalize(() => {
        this.isLoggingOut.set(false);
        this.authSessionService.clearSession();
        void this.router.navigateByUrl('/connexion');
      })
    ).subscribe();
  }
}
