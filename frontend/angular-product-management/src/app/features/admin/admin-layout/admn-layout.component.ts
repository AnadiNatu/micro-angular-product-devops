import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HighlightDirective } from '../../../shared/directives/highlight.directive';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
   imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , HeaderComponent , SidebarComponent , RouterOutlet],
})
export class AdminLayoutComponent {
  constructor() {
    console.log('AdminLayoutComponent initialized');
  }
}