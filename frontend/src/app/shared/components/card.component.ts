import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrl: './card.component.scss'
})
export class CardComponent {}

@Component({
  selector: 'app-card-header',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: grid;
      gap: 0.375rem;
      padding: 1.5rem 1.5rem 0;
    }
  `]
})
export class CardHeaderComponent {}

@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1;
      color: var(--amber-950);
    }
  `]
})
export class CardTitleComponent {}

@Component({
  selector: 'app-card-description',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      font-size: 0.875rem;
      color: var(--amber-700);
    }
  `]
})
export class CardDescriptionComponent {}

@Component({
  selector: 'app-card-content',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      padding: 0 1.5rem 1.5rem;
    }
  `]
})
export class CardContentComponent {}
