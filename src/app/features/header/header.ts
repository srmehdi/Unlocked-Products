import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { State } from '../../core/services/state/state';
import { Role } from '../../shared/utils/enums';
import { Storage } from '../../core/services/storage/storage';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isMenuOpen = false;
  state = inject(State);
  user = this.state.user;
  roles: typeof Role = Role;
  popupOpen = signal(false);
  router = inject(Router);
  storage = inject(Storage);

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  togglePopup() {
    this.popupOpen.update((v) => !v);
  }

  closePopup() {
    this.popupOpen.set(false);
  }

  logout() {
    this.storage.clearStorage();
    this.closePopup();
    this.router.navigate(['/login']);
  }
}
