import { Injectable, OnDestroy } from '@angular/core';
import { State } from '../state/state';
import { Http } from '../http/http';

@Injectable({ providedIn: 'root' })
export class Activity implements OnDestroy {
  private intervalId!: number;
  private readonly INTERVAL = 30000;
  private pingIntervalId: any = null;
  private inactivityTimeoutId: any = null;

  private readonly PING_INTERVAL = 60 * 1000;
  private readonly INACTIVITY_LIMIT = 120 * 1000;

  constructor(
    private state: State,
    private http: Http,
  ) {
    // this.handleVisibilityChange();
  }

  // startTracking() {
  //   const visitorId = this.state.getVisitorId();

  //   this.sendPing(visitorId);

  //   this.intervalId = window.setInterval(() => {
  //     this.sendPing(visitorId);
  //   }, this.INTERVAL);
  // }
  startTracking() {
    const resetTimers = () => {
      this.startPing();
      this.resetInactivityTimer();
    };

    ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
      window.addEventListener(event, resetTimers, { passive: true });
    });

    resetTimers();
  }

  private startPing() {
    if (this.pingIntervalId) return;
    const visitorId = this.state.getVisitorId();
    this.sendPing(visitorId);

    this.pingIntervalId = setInterval(() => {
      this.sendPing(visitorId);
    }, this.PING_INTERVAL);
  }
  resetInactivityTimer() {
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
    }

    this.inactivityTimeoutId = setTimeout(() => {
      this.stopPing();
    }, this.INACTIVITY_LIMIT);
  }
  private stopPing() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  private sendPing(visitorId: string) {
    const payload = { visitorId: visitorId };
    this.http.sendPing(payload).subscribe({
      next: (resp) => {
        console.log('sendPing resp', resp);
      },
      error: (err) => {
        console.log('sendPing error', err);
      },
    });
  }
  private handleVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopPing();
      } else {
        this.startPing();
        this.resetInactivityTimer();
      }
    });
  }
  ngOnDestroy() {
    clearInterval(this.pingIntervalId);
  }
}
