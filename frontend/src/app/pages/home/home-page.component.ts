import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ENVIRONMENT } from '../../core/config/app-environment';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  protected readonly environment = inject(APP_ENVIRONMENT);

  protected readonly foundationItems = [
    'Routing principal avec shell et page 404',
    'Configuration environnementale de l’URL backend',
    'Client HTTP mutualisé avec intercepteurs',
    'Décapsulation automatique du format { data, timestamp }',
    'Transformation centralisée des erreurs backend',
    'Préparation de l’injection du bearer token',
  ];
}
