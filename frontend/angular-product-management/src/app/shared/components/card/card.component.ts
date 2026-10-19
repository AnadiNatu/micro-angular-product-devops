import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, booleanAttribute } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HighlightDirective } from '../../directives/highlight.directive';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  standalone: true,
  imports: [RouterLink, CommonModule, HighlightDirective , NzCardModule , NzButtonModule , NzIconModule , NzTagModule]
})
export class CardComponent {
  @Input({ required: true }) title: string = '';
  @Input() actionLabel: string = 'View Details';
  @Input({ transform: booleanAttribute }) isFeatured: boolean = false;
  @Input() disableAction: boolean = false;
  @Output() action = new EventEmitter<void>();

  onActionClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.action.emit();
  }

  getCardClasses(): string {
    return this.isFeatured ? 'card h-100 border-success shadow-sm' : 'card h-100';
  }
}
