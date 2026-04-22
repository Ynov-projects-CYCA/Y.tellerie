import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, LucideX],
  template: `
    <div class="dialog-overlay" (click)="onOverlayClick($event)">
      <div class="dialog-content" [class.dialog-content--large]="size() === 'lg'" [class.dialog-content--small]="size() === 'sm'">
        <button class="dialog-close" (click)="close.emit()" aria-label="Fermer">
          <svg lucideX></svg>
        </button>
        <div class="dialog-inner">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  close = output<void>();

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.close.emit();
    }
  }
}
