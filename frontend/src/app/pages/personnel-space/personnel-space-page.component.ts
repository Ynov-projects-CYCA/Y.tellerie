import { Component } from '@angular/core';
import { AccountPanelComponent } from '../account/account-panel.component';

@Component({
  selector: 'app-personnel-space-page',
  standalone: true,
  imports: [AccountPanelComponent],
  templateUrl: './personnel-space-page.component.html',
  styleUrl: './personnel-space-page.component.scss',
})
export class PersonnelSpacePageComponent {}
