import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ns-search-box',
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.css',
})
export class SearchBoxComponent {
  readonly placeholder = input<string>('Buscar');
  readonly value = input<string>('');
  readonly valueChange = output<string>();
}
