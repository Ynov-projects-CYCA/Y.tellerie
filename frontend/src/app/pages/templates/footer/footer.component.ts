import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideHotel } from '@lucide/angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideHotel],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  legalLinks = [
    { label: 'Mentions légales', route: '/mentions-legales' },
    { label: 'Confidentialité', route: '/confidentialite' },
    { label: 'Conditions', route: '/conditions-utilisation' },
  ];
}
