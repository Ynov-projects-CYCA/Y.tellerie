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

  handleDropdownAction(event: any, item: any): void {
    const action = event.target.value;
    if (action) {
      this.actionEvent.emit({ action, item });
      // Reset the dropdown
      event.target.value = '';
    }
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
