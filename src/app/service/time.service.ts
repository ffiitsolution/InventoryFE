import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private currentTimeSubject = new Subject<Date>();
  currentTime$ = this.currentTimeSubject.asObservable();

  private serverCheckTime = new Subject<Date>();
  serverTime$ = this.serverCheckTime.asObservable();

  constructor() {
    setInterval(() => {
      this.currentTimeSubject.next(new Date());
    }, 1000); // Update every 1000 milliseconds (every second)

    setInterval(() => {
      this.serverCheckTime.next(new Date());
    }, 10000); // Update every 10000 milliseconds (every 10 second)
  }
}
