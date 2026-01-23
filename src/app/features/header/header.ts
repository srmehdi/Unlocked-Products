import { Component, inject, signal, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { State } from '../../core/services/state/state';
import { Role } from '../../shared/utils/enums';
import { Storage } from '../../core/services/storage/storage';
import { Http } from '../../core/services/http/http';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @ViewChild('profilePopup', { static: false }) profilePopup!: ElementRef;
  @ViewChild('profileButton', { static: false }) profileButton!: ElementRef;
  @ViewChild('mobileMenu', { static: false }) mobileMenu!: ElementRef;
  @ViewChild('menuButton', { static: false }) menuButton!: ElementRef;

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    // if (!this.popupOpen()) return;
    const target = event.target as HTMLElement;
    const clickedInsidePopup = this.profilePopup?.nativeElement.contains(target);
    const clickedProfileButton = this.profileButton?.nativeElement.contains(target);
    if (!clickedInsidePopup && !clickedProfileButton) {
      this.popupOpen.set(false);
    }
    // if (!this.isMenuOpen()) return;
    const clickedInsideMenu = this.mobileMenu?.nativeElement.contains(target);
    const clickedMenuButton = this.menuButton?.nativeElement.contains(target);
    if (!clickedInsideMenu && !clickedMenuButton) {
      this.isMenuOpen.set(false);
    }
  }

  isMenuOpen = signal(false);
  state = inject(State);
  user = this.state.user;
  roles: typeof Role = Role;
  popupOpen = signal(false);
  router = inject(Router);
  storage = inject(Storage);
  ngOnInit() {
    if (this.user()?.role?.includes(this.roles.ADMIN)) {
      this.getActivityStats();
    }
  }
  http = inject(Http);
  activityStats: any;
  getActivityStats() {
    this.http.getActivityStats().subscribe({
      next: (resp) => {
        console.log('getActivityStats resp', resp);
        this.activityStats = resp;
      },
      error: (err) => {
        console.log('getActivityStats error', err);
      },
    });
  }
  toggleMenu(event?: MouseEvent) {
    event?.stopPropagation();
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  togglePopup(event?: MouseEvent) {
    event?.stopPropagation();
    this.popupOpen.set(!this.popupOpen());
  }

  closePopup() {
    this.popupOpen.set(false);
  }

  logout() {
    this.storage.clearStorage();
    this.state.resetUser();
    this.closePopup();
    this.router.navigate(['/login']);
  }
}
