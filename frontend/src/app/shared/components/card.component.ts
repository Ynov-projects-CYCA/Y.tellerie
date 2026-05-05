import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrl: './card.component.scss',
  host: {
    '[class.is-hoverable]': 'hoverable'
  }
})
export class CardComponent {
  @Input({ transform: booleanAttribute }) hoverable = false;
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    'class': 'card-header'
  }
})
export class CardHeaderComponent {}

@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    'class': 'card-title'
  }
})
export class CardTitleComponent {}

@Component({
  selector: 'app-card-description',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    'class': 'card-description'
  }
})
export class CardDescriptionComponent {}

@Component({
  selector: 'app-card-content',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    'class': 'card-content'
  }
})
export class CardContentComponent {}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    'class': 'card-footer'
  }
})
export class CardFooterComponent {}
