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
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

@Component({
  selector: 'app-lifecycle-demo',
  templateUrl: './lifecycle-demo.component.html',
  styleUrls: ['./lifecycle-demo.component.css'],
  standalone: true,
  imports: [RouterLink, CommonModule, HighlightDirective, 

    NzAlertModule,
    NzButtonModule,
    NzCardModule,
    NzCollapseModule,
    NzIconModule,
    NzStatisticModule
  ]
})
export class LifecycleDemoComponent
  implements OnInit, OnDestroy, OnChanges, DoCheck,
    AfterContentInit, AfterContentChecked,
    AfterViewInit, AfterViewChecked {

  @Input() demoData: string = 'Initial Data';

  lifecycleLogs: string[] = [];
  counter: number = 0;
  // private intervalId: any;
  private intervalId : ReturnType<typeof setInterval> |  undefined;

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
