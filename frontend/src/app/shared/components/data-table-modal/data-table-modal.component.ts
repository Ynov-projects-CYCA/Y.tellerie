import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'currency' | 'date';
  sortable?: boolean;
  width?: string;
}

export interface TableAction {
  label: string;
  action: string;
  color?: 'primary' | 'secondary' | 'danger' | 'success';
  condition?: (item: any) => boolean;
}

export interface TableModalConfig {
  title: string;
  subtitle?: string;
  columns: TableColumn[];
  data: any[];
  actions?: TableAction[];
  loading?: boolean;
  emptyMessage?: string;
  useDropdownForActions?: boolean;
}

export type TableConfig = TableModalConfig;

@Component({
  selector: 'app-data-table-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table-modal.component.html',
  styleUrls: ['./data-table-modal.component.scss']
})
export class DataTableModalComponent {
  @Input() config!: TableModalConfig;
  @Output() close = new EventEmitter<void>();
  @Output() actionEvent = new EventEmitter<{ action: string; item: any }>();
  @Output() rowClick = new EventEmitter<any>();

  sortKey: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  get sortedData(): any[] {
    if (!this.config?.data || !this.sortKey) {
      return this.config?.data || [];
    }

    const key = this.sortKey!;
    const sorted = [...this.config.data].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue == null || bValue == null) {
        return 0;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return this.sortDirection === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return sorted;
  }

  handleClose(): void {
    this.close.emit();
  }

  handleAction(action: string, item: any): void {
    this.actionEvent.emit({ action, item });
  }

  handleDropdownAction(event: Event, item: any): void {
    const select = event.target as HTMLSelectElement;
    const action = select.value;
    if (action) {
      this.actionEvent.emit({ action, item });
      // On remet le select a zero pour que la meme action reste relancable.
      select.value = '';
    }
  }

  getStatusBadgeClass(value: unknown): string {
    const normalizedValue = String(value).toLowerCase();

    if (
      ['active', 'available', 'confirmed', 'actif', 'disponible', 'confirmée'].includes(normalizedValue)
    ) {
      return 'status-badge status-badge--success';
    }

    if (
      ['occupied', 'inactive', 'canceled', 'payment_failed', 'occupée', 'inactif', 'annulée', 'paiement échoué'].includes(normalizedValue)
    ) {
      return 'status-badge status-badge--danger';
    }

    if (
      ['pending_payment', 'refund_requested', 'dirty', 'en attente paiement', 'remboursement demandé', 'à nettoyer'].includes(normalizedValue)
    ) {
      return 'status-badge status-badge--warning';
    }

    return 'status-badge status-badge--neutral';
  }

  handleSort(column: TableColumn): void {
    if (!column.sortable) {
      return;
    }

    if (this.sortKey === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = column.key;
      this.sortDirection = 'asc';
    }
  }

  emitRowClick(item: any): void {
    this.rowClick.emit(item);
  }
}
