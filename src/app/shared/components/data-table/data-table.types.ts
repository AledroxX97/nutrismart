export type DataTableValue = string | number | Date | null | undefined;

export interface DataTableColumn<T> {
  id: string;
  label: string;
  value: (row: T) => DataTableValue;
  display?: (row: T) => string;
  sortable?: boolean;
  searchable?: boolean;
}

export interface DataTableAction<T> {
  id: string;
  label: (row: T) => string;
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export interface DataTableActionEvent<T> {
  actionId: string;
  row: T;
}
