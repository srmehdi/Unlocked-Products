import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Back } from '../../shared/directives/back/back';

@Component({
  selector: 'app-not-found',
  imports: [Back],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  router = inject(Router);
  goToDashboard() {
    this.router.navigate(['']);
  }
}
