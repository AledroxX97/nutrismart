import { Component, input } from '@angular/core';

@Component({
  selector: 'ns-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  readonly active = input.required<boolean>();
  readonly activeLabel = input<string>('Activo');
  readonly inactiveLabel = input<string>('Inactivo');
}
