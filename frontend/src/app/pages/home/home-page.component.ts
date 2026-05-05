import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideCalendar,
  LucideHotel,
  LucideUsers,
  LucideChartBar,
  LucideShieldCheck,
  LucideClock,
} from '@lucide/angular';
import {ButtonComponent} from '../../shared/components/button.component';
import {CardComponent} from '../../shared/components/card.component';
interface Feature {
  icon: any;
  title: string;
  description: string;
}

interface Benefit {
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  features: Feature[] = [
    {
      icon: LucideCalendar,
      title: 'Réservations en ligne',
      description: 'Système de réservation intuitif pour vos clients avec confirmation instantanée.',
    },
    {
      icon: LucideHotel,
      title: 'Gestion des chambres',
      description:
        "Gérez facilement la disponibilité, les tarifs et l'état de vos chambres.",
    },
    {
      icon: LucideUsers,
      title: 'Gestion du personnel',
      description:
        'Organisez les équipes, horaires et tâches de votre personnel efficacement.',
    },
    {
      icon: LucideChartBar,
      title: 'Statistiques en temps réel',
      description:
        'Suivez vos performances avec des tableaux de bord détaillés.',
    },
    {
      icon: LucideShieldCheck,
      title: 'Sécurisé et fiable',
      description:
        'Vos données sont protégées avec les dernières technologies de sécurité.',
    },
    {
      icon: LucideClock,
      title: 'Support 24/7',
      description:
        'Une équipe dédiée disponible pour vous accompagner à tout moment.',
    },
  ];

  benefits: Benefit[] = [
    {
      number: '1',
      title: 'Interface intuitive',
      description: 'Conçue pour être facile à utiliser, même sans formation technique.',
    },
    {
      number: '2',
      title: 'Gain de temps',
      description:
        "Automatisez vos tâches répétitives et concentrez-vous sur l'essentiel.",
    },
    {
      number: '3',
      title: 'Augmentez vos revenus',
      description:
        "Optimisez vos tarifs et votre taux d'occupation avec nos outils intelligents.",
    },
  ];

  stats = [
    { value: '500+', label: 'Hôtels' },
    { value: '10k+', label: 'Réservations/mois' },
    { value: '24/7', label: 'Support' },
  ];

  scrollTo(anchor: string): void {
    const el = document.querySelector(anchor);
    el?.scrollIntoView({ behavior: 'smooth' });
  }

}
