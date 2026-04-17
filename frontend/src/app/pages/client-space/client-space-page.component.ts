import { Component } from '@angular/core';
import { AccountPanelComponent } from '../account/account-panel.component';

@Component({
  selector: 'app-client-space-page',
  standalone: true,
  imports: [AccountPanelComponent],
  templateUrl: './client-space-page.component.html',
  styleUrl: './client-space-page.component.scss',
})
export class ClientSpacePageComponent {}
