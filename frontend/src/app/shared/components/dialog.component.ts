import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, LucideX],
  templateUrl: './dialog.component.html',
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
