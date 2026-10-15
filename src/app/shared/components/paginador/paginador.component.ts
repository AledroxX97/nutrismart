import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'ns-paginador',
  standalone: true,
  templateUrl: './paginador.component.html',
  styleUrl: './paginador.component.css',
})
export class PaginadorComponent {
  readonly totalItems = input(0);
  readonly pageSize = input(10);
  readonly currentPage = input(0);
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  readonly firstItem = computed(() =>
    this.totalItems() === 0 ? 0 : this.currentPage() * this.pageSize() + 1,
  );
  readonly lastItem = computed(() =>
    Math.min((this.currentPage() + 1) * this.pageSize(), this.totalItems()),
  );
  readonly pages = computed(() => {
    const visibleCount = 5;
    const lastPage = this.totalPages() - 1;
    const firstPage = Math.max(0, Math.min(this.currentPage() - 2, lastPage - visibleCount + 1));
    const pageCount = Math.min(visibleCount, this.totalPages());
    return Array.from({ length: pageCount }, (_, index) => firstPage + index);
  });

  changePage(page: number): void {
    this.pageChange.emit(Math.max(0, Math.min(page, this.totalPages() - 1)));
  }

  changePageSize(value: string): void {
    this.pageSizeChange.emit(Number(value));
  }
}
