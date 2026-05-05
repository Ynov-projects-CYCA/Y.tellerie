import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type TableColumnType = 'text' | 'number' | 'date' | 'currency' | 'status';

export interface GenericTableColumn<T = any> {
  key: keyof T & string;
  label: string;
  type?: TableColumnType;
  sortable?: boolean;
  searchable?: boolean;
}

export interface GenericTableAction<T = any> {
  label: string;
  action: string;
  color?: 'primary' | 'secondary' | 'success' | 'danger';
  condition?: (row: T) => boolean;
}

@Component({
  selector: 'app-generic-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generic-data-table.component.html',
  styleUrls: ['./generic-data-table.component.scss']
})
export class GenericDataTableComponent<T extends Record<string, any>> {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() data: T[] = [];
  @Input() columns: GenericTableColumn<T>[] = [];
  @Input() actions: GenericTableAction<T>[] = [];
  @Input() emptyMessage = 'Aucune donnée trouvée.';
  @Input() addButtonLabel = '';

  @Output() actionClick = new EventEmitter<{ action: string; row: T }>();
  @Output() addClick = new EventEmitter<void>();

  globalSearch = '';
  fieldKey = '';
  fieldSearch = '';
  sortKey = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get searchableColumns(): GenericTableColumn<T>[] {
    return this.columns.filter(column => column.searchable !== false);
  }

  get displayedData(): T[] {
    let result = [...this.data];

    const global = this.normalize(this.globalSearch);
    if (global) {
      result = result.filter(row =>
        this.searchableColumns.some(column =>
          this.normalize(row[column.key]).includes(global)
        )
      );
    }

    const fieldValue = this.normalize(this.fieldSearch);
    if (this.fieldKey && fieldValue) {
      result = result.filter(row =>
        this.normalize(row[this.fieldKey]).includes(fieldValue)
      );
    }

    if (this.sortKey) {
      result.sort((a, b) => {
        const valueA = a[this.sortKey];
        const valueB = b[this.sortKey];

        if (valueA == null) return 1;
        if (valueB == null) return -1;

        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }

        const comparison = String(valueA).localeCompare(String(valueB), 'fr', {
          numeric: true,
          sensitivity: 'base'
        });

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }

  setSort(column: GenericTableColumn<T>, direction: 'asc' | 'desc'): void {
    if (column.sortable === false) return;

    this.sortKey = column.key;
    this.sortDirection = direction;
  }

  emitAdd(): void {
    this.addClick.emit();
  }

  emitAction(action: string, row: T): void {
    this.actionClick.emit({ action, row });
  }

  clearFilters(): void {
    this.globalSearch = '';
    this.fieldKey = '';
    this.fieldSearch = '';
    this.sortKey = '';
    this.sortDirection = 'asc';
  }

  formatValue(row: T, column: GenericTableColumn<T>): string {
    const value = row[column.key];

    if (value == null || value === '') return '-';

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('fr-FR');
    }

    if (column.type === 'currency') {
      return `${value}€`;
    }

    return String(value);
  }

  getStatusClass(value: unknown): string {
    const status = String(value);

    if (['active', 'available', 'confirmed', 'completed'].includes(status)) {
      return 'status-badge status-badge--success';
    }

    if (['pending'].includes(status)) {
      return 'status-badge status-badge--warning';
    }

    if (['inactive', 'occupied', 'cancelled'].includes(status)) {
      return 'status-badge status-badge--danger';
    }

    return 'status-badge status-badge--neutral';
  }

  private normalize(value: unknown): string {
    return String(value ?? '').toLowerCase().trim();
  }
}