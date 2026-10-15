import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ns-app-brand',
  imports: [RouterLink],
  templateUrl: './app-brand.component.html',
  styleUrl: './app-brand.component.css',
})
export class AppBrandComponent {
  readonly destination = input<string>('/inicio');
  readonly light = input(false);
}
