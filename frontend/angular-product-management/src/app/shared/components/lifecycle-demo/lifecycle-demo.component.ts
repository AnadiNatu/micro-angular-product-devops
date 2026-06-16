import { CommonModule } from '@angular/common';
import { 
  Component, 
  OnInit, 
  OnDestroy, 
  OnChanges, 
  DoCheck,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  SimpleChanges,
  Input
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HighlightDirective } from '../../directives/highlight.directive';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-lifecycle-demo',
  templateUrl: './lifecycle-demo.component.html',
  styleUrls: ['./lifecycle-demo.component.css'],
  standalone: true,
  imports: [RouterLink, CommonModule, HighlightDirective]
})
export class LifecycleDemoComponent
  implements OnInit, OnDestroy, OnChanges, DoCheck,
    AfterContentInit, AfterContentChecked,
    AfterViewInit, AfterViewChecked {

  @Input() demoData: string = 'Initial Data';

  lifecycleLogs: string[] = [];
  counter: number = 0;
  private intervalId: any;

  constructor() {
    this.log('🔧 constructor() - Component instance created');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.log('🔄 ngOnChanges() - Input properties changed');
  }

  ngOnInit(): void {
    this.log('✅ ngOnInit() - Component initialized');
    this.intervalId = setInterval(() => {
      this.counter++;
    }, 2000);
  }

  ngDoCheck(): void {}

  ngAfterContentInit(): void {
    this.log('📦 ngAfterContentInit() - Content projected');
  }

  ngAfterContentChecked(): void {}

  ngAfterViewInit(): void {
    this.log('👁️ ngAfterViewInit() - View initialized');
  }

  ngAfterViewChecked(): void {}

  ngOnDestroy(): void {
    this.log('🗑️ ngOnDestroy() - Component destroyed');
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  clearLogs(): void {
    this.lifecycleLogs = [];
  }

  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    this.lifecycleLogs.push(logEntry);
    if (this.lifecycleLogs.length > 15) {
      this.lifecycleLogs.shift();
    }
  }
}
