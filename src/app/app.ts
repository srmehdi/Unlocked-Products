import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Activity } from './core/services/activity/activity';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  activity = inject(Activity);
  ngOnInit() {
    this.activity.startTracking();
    this.activity.resetInactivityTimer();
  }
}
