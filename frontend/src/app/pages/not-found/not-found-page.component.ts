import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {ButtonComponent} from '../../shared/components/button.component';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
})
export class NotFoundPageComponent {}
