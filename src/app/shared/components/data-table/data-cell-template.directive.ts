import { Directive, TemplateRef, inject, input } from '@angular/core';

@Directive({ selector: 'ng-template[nsDataCell]', standalone: true })
export class DataCellTemplateDirective<T = unknown> {
  readonly nsDataCell = input.required<string>();
  readonly template = inject<TemplateRef<{ $implicit: T }>>(TemplateRef);
}
