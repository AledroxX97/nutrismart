import { Component, input } from '@angular/core';

@Component({
  selector: 'ns-page-heading',
  templateUrl: './page-heading.component.html',
  styleUrl: './page-heading.component.css',
})
export class PageHeadingComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
