import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Feature {
  icon: string;
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
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  features: Feature[] = [
    {
      icon: '📅',
      title: 'Réservations en ligne',
      description: 'Système de réservation intuitif pour vos clients avec confirmation instantanée.',
    },
    {
      icon: '🏨',
      title: 'Gestion des chambres',
      description:
        "Gérez facilement la disponibilité, les tarifs et l'état de vos chambres.",
    },
    {
      icon: '👥',
      title: 'Gestion du personnel',
      description:
        'Organisez les équipes, horaires et tâches de votre personnel efficacement.',
    },
    {
      icon: '📊',
      title: 'Statistiques en temps réel',
      description:
        'Suivez vos performances avec des tableaux de bord détaillés.',
    },
    {
      icon: '🛡️',
      title: 'Sécurisé et fiable',
      description:
        'Vos données sont protégées avec les dernières technologies de sécurité.',
    },
    {
      icon: '⏰',
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
