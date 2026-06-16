
import { Directive, ElementRef, HostListener, Input, HostBinding } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input('appHighlight') highlightColor: string = '';

  @HostBinding('style.backgroundColor')
  backgroundColor: string = '';

  @HostBinding('style.transition')
  transition: string = 'background-color 0.3s ease, transform 0.2s ease';

  @HostBinding('style.cursor')
  cursor: string = 'pointer';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.backgroundColor = this.highlightColor || '#f0f7ff';
    this.el.nativeElement.style.transform = 'scale(1.02)';
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.backgroundColor = '';
    this.el.nativeElement.style.transform = 'scale(1)';
  }
}