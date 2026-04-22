import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="field-group">
      @if (label()) {
        <label [for]="id()" class="field-label">{{ label() }}</label>
      }
      <input
        [id]="id()"
        [type]="type()"
        [formControl]="control()"
        [placeholder]="placeholder()"
        class="field-input"
        [class.field-input--error]="control().invalid && control().touched"
      />
      @if (control().invalid && control().touched) {
        <span class="field-error">Champ invalide</span>
      }
    </div>
  `,
  styles: [`

    .field-group {
      display: grid;
      gap: 0.5rem;
      width: 100%;
    }

    .field-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #57534e;
    }

    .field-input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 0.625rem;
      font-size: 1rem;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #d97706;
        background: white;
        box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.1);
      }

      &--error { border-color: #dc2626; }
    }

    .field-error {
      font-size: 0.75rem;
      color: #dc2626;
      font-weight: 500;
    }
  `]
})
export class InputComponent {
  id = input.required<string>();
  label = input<string>();
  type = input<string>('text');
  placeholder = input<string>('');
  control = input.required<FormControl>();
}
