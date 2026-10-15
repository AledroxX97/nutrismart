import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFooterComponent } from '../../shared/components/app-footer/app-footer.component';
import { WorkspaceHeaderComponent } from '../workspace-header/workspace-header.component';
import { WorkspaceSidebarComponent } from '../workspace-sidebar/workspace-sidebar.component';

@Component({
  selector: 'ns-workspace-layout',
  imports: [RouterOutlet, WorkspaceHeaderComponent, WorkspaceSidebarComponent, AppFooterComponent],
  templateUrl: './workspace-layout.component.html',
  styleUrl: './workspace-layout.component.css',
})
export class WorkspaceLayoutComponent {}
