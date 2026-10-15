import { Component, input } from '@angular/core';

@Component({
  selector: 'ns-metric-card',
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.css',
})
export class MetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string>('');
  readonly icon = input<string>('•');
}
