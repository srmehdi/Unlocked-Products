import { Directive, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Directive({
  selector: '[appBack]',
})
export class Back {
  @Input() fallbackRoute: string = '/';

  private startX = 0;
  private currentX = 0;

  private readonly EDGE_LIMIT = 40;
  private readonly TRIGGER_DISTANCE = 120;

  constructor(
    private location: Location,
    private router: Router,
  ) {}

  @HostListener('click')
  onClick() {
    this.goBack();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    const x = event.touches[0].clientX;
    this.startX = x <= this.EDGE_LIMIT ? x : 0;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.startX) return;
    this.currentX = event.touches[0].clientX;
  }
  @HostListener('touchend')
  onTouchEnd() {
    if (!this.startX) return;

    const distance = this.currentX - this.startX;
    if (distance > this.TRIGGER_DISTANCE) {
      this.goBack();
    }

    this.reset();
  }

  private goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate([this.fallbackRoute]);
    }
  }

  private reset() {
    this.startX = 0;
    this.currentX = 0;
  }
}
