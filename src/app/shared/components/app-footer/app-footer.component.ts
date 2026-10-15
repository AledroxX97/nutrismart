import { Component, input } from '@angular/core';

@Component({
  selector: 'ns-app-footer',
  templateUrl: './app-footer.component.html',
  styleUrl: './app-footer.component.css',
})
export class AppFooterComponent {
  readonly note = input<string>('');
  readonly compact = input(false);
}
