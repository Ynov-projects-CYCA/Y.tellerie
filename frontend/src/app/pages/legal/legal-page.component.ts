import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type LegalPageKey = 'mentions' | 'privacy' | 'terms';

interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalPageContent {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}

const LEGAL_CONTENT: Record<LegalPageKey, LegalPageContent> = {
  // Donnees volontaires fictives : elles cadrent le projet sans se faire passer pour un avis juridique.
  mentions: {
    eyebrow: 'Informations légales',
    title: 'Mentions légales',
    intro:
      'Ces informations sont fictives et servent de base réaliste pour le projet Ytellerie.',
    sections: [
      {
        title: 'Éditeur du site',
        paragraphs: [
          'Ytellerie SAS, société par actions simplifiée au capital fictif de 20 000 €, immatriculée au RCS de Paris sous le numéro 912 345 678.',
          'Siège social fictif : 18 rue des Hôtels, 75009 Paris, France. Contact : contact@ytellerie.fr.',
        ],
      },
      {
        title: 'Direction de la publication',
        paragraphs: [
          'La direction de la publication est assurée par Camille Martin, en qualité de présidente fictive de Ytellerie SAS.',
        ],
      },
      {
        title: 'Hébergement',
        paragraphs: [
          'Le site est hébergé fictivement par HexaCloud Hosting, 42 avenue des Serveurs, 69003 Lyon, France.',
        ],
      },
      {
        title: 'Propriété intellectuelle',
        paragraphs: [
          'Les textes, interfaces et éléments graphiques du projet Ytellerie sont présentés dans un cadre pédagogique. Toute réutilisation hors projet doit respecter les droits des auteurs concernés.',
        ],
      },
    ],
  },
  privacy: {
    eyebrow: 'RGPD',
    title: 'Politique de confidentialité',
    intro:
      'Cette politique explique simplement comment Ytellerie traite les données personnelles dans ce projet fictif.',
    sections: [
      {
        title: 'Données collectées',
        paragraphs: [
          'Ytellerie peut traiter les données nécessaires au compte utilisateur : prénom, nom, adresse e-mail, téléphone, rôle et informations de connexion.',
          'Lors d’une réservation, les dates de séjour, la chambre choisie, le prix, le statut de paiement et les demandes particulières peuvent aussi être enregistrés.',
        ],
      },
      {
        title: 'Finalités et bases légales',
        paragraphs: [
          'Les données sont utilisées pour créer le compte, gérer les réservations, sécuriser l’accès et envoyer les e-mails utiles au service.',
          'Le traitement repose principalement sur l’exécution du contrat, l’intérêt légitime de sécurité et, si besoin, le respect d’obligations légales.',
        ],
      },
      {
        title: 'Prestataires',
        paragraphs: [
          'Stripe est utilisé pour le paiement en ligne et Mailjet pour l’envoi des e-mails transactionnels. Ces prestataires ne reçoivent que les informations nécessaires à leur mission.',
        ],
      },
      {
        title: 'Durée de conservation',
        paragraphs: [
          'Les données de compte sont conservées tant que le compte existe. Les données de réservation et de facturation peuvent être conservées jusqu’à 10 ans pour respecter les obligations comptables fictives.',
        ],
      },
      {
        title: 'Droits RGPD',
        paragraphs: [
          'Chaque utilisateur peut demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de ses données en écrivant à rgpd@ytellerie.fr.',
          'En cas de difficulté, l’utilisateur peut aussi contacter la CNIL.',
        ],
      },
      {
        title: 'Cookies',
        paragraphs: [
          'Le projet utilise uniquement les stockages techniques nécessaires à la session et à la sécurité. Aucun cookie publicitaire n’est prévu dans cette version.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'Conditions',
    title: 'Conditions d’utilisation',
    intro:
      'Ces conditions encadrent l’utilisation de la plateforme fictive Ytellerie dans le cadre du projet.',
    sections: [
      {
        title: 'Objet',
        paragraphs: [
          'Ytellerie propose une interface de gestion hôtelière et de réservation en ligne. Les fonctionnalités présentées servent de démonstration et ne constituent pas une offre commerciale réelle.',
        ],
      },
      {
        title: 'Compte utilisateur',
        paragraphs: [
          'L’utilisateur doit fournir des informations exactes lors de son inscription et garder ses identifiants confidentiels.',
          'Ytellerie peut refuser ou suspendre un accès en cas d’usage abusif, frauduleux ou contraire à la sécurité de l’application.',
        ],
      },
      {
        title: 'Réservations et paiements',
        paragraphs: [
          'Les réservations, prix et paiements affichés sont fictifs. Le parcours Stripe représente un flux technique de paiement et ne confirme aucune prestation réelle.',
        ],
      },
      {
        title: 'Responsabilité',
        paragraphs: [
          'Ytellerie est fourni comme projet pédagogique. Malgré le soin apporté au développement, aucune garantie commerciale ou juridique réelle n’est attachée à cette démonstration.',
        ],
      },
      {
        title: 'Droit applicable',
        paragraphs: [
          'Ces conditions fictives sont rédigées selon le droit français, dans l’esprit d’une société française soumise au RGPD.',
        ],
      },
    ],
  },
};

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.scss',
})
export class LegalPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly content = computed(() => {
    const page = this.route.snapshot.data['legalPage'] as LegalPageKey | undefined;
    return LEGAL_CONTENT[page ?? 'mentions'];
  });
}
