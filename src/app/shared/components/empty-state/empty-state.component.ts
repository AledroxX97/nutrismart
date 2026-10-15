import { Component, input } from '@angular/core';

@Component({
  selector: 'ns-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input<string>('⌕');
}
