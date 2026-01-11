import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { State } from '../../core/services/state/state';
import { Role } from '../../shared/utils/enums';

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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
