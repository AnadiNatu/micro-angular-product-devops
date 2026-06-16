import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, AfterViewInit, DoCheck, ChangeDetectorRef } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, NavigationStart, NavigationEnd, NavigationError, RouterLink, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink
  ]
})
export class AppComponent {

  // title = 'OrderFlow Pro - Angular 17';

  // isLoading = false;

  // constructor(private router: Router) {}

  // ngOnInit(): void {

  //   this.router.events.subscribe(event => {

  //     if (event instanceof NavigationStart) {
  //       this.isLoading = true;
  //     }

  //     if (
  //       event instanceof NavigationEnd ||
  //       event instanceof NavigationError
  //     ) {
  //       this.isLoading = false;
  //     }

  //   });

  // }
}