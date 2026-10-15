import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  QueryList,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { DataCellTemplateDirective } from './data-cell-template.directive';
import { DataTableAction, DataTableActionEvent, DataTableColumn } from './data-table.types';
import { PaginadorComponent } from '../paginador/paginador.component';

@Component({
  selector: 'ns-data-table',
  imports: [CommonModule, PaginadorComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent<T> {
  readonly rows = input.required<T[]>();
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly rowKey = input<(row: T) => unknown>((row) => row);
  readonly actions = input<DataTableAction<T>[]>([]);
  readonly searchPlaceholder = input('Buscar');
  readonly emptyMessage = input('No hay registros para mostrar.');
  readonly actionSelected = output<DataTableActionEvent<T>>();
  readonly query = signal('');
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  @ContentChildren(DataCellTemplateDirective) cellTemplates!: QueryList<
    DataCellTemplateDirective<T>
  >;

  readonly filteredRows = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('es-CO');
    if (!query) return this.rows();
    const columns = this.columns().filter((column) => column.searchable !== false);
    return this.rows().filter((row) =>
      columns.some((column) => {
        const raw = column.value(row);
        const visible = column.display?.(row);
        return `${raw ?? ''} ${visible ?? ''}`.toLocaleLowerCase('es-CO').includes(query);
      }),
    );
  });

  readonly sortedRows = computed(() => {
    const columnId = this.sortColumn();
    if (!columnId) return this.filteredRows();
    const column = this.columns().find((item) => item.id === columnId);
    if (!column) return this.filteredRows();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    return [...this.filteredRows()].sort(
      (a, b) => direction * this.compare(column.value(a), column.value(b)),
    );
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedRows().length / this.pageSize())),
  );
  readonly safePage = computed(() => Math.min(this.currentPage(), this.totalPages() - 1));
  readonly pageRows = computed(() =>
    this.sortedRows().slice(
      this.safePage() * this.pageSize(),
      (this.safePage() + 1) * this.pageSize(),
    ),
  );

  setQuery(value: string): void {
    this.query.set(value);
    this.currentPage.set(0);
  }
  toggleSort(column: DataTableColumn<T>): void {
    if (column.sortable === false) return;
    if (this.sortColumn() === column.id)
      this.sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    else {
      this.sortColumn.set(column.id);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(0);
  }
  setPage(page: number): void {
    this.currentPage.set(page);
  }
  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
  }
  templateFor(columnId: string): DataCellTemplateDirective<T> | undefined {
    return this.cellTemplates?.find((item) => item.nsDataCell() === columnId);
  }
  runAction(actionId: string, row: T): void {
    this.actionSelected.emit({ actionId, row });
  }
  displayValue(column: DataTableColumn<T>, row: T): string {
    return column.display?.(row) ?? String(column.value(row) ?? '—');
  }
  private compare(a: unknown, b: unknown): number {
    if (a == null) return b == null ? 0 : -1;
    if (b == null) return 1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    const left = a instanceof Date ? a.getTime() : String(a);
    const right = b instanceof Date ? b.getTime() : String(b);
    if (typeof left === 'number' && typeof right === 'number') return left - right;
    return String(left).localeCompare(String(right), 'es-CO', {
      numeric: true,
      sensitivity: 'base',
    });
  }
}
