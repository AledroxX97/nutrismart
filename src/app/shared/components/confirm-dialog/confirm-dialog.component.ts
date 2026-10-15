import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ns-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  readonly visible = input(false);
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input<string>('Confirmar');
  readonly confirmed = output<void>();
  readonly dismissed = output<void>();
}
