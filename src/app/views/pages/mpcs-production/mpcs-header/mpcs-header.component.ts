import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { ClassToggleService, HeaderComponent } from '@coreui/angular';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { WebsocketService } from '../../../../service/websocket.service';

@Component({
  selector: 'app-mpcs-header',
  templateUrl: './mpcs-header.component.html',
})
export class MpcsHeaderComponent
  extends HeaderComponent
  implements OnInit, OnDestroy
{
  @Input() sidebarId: string = 'sidebar';

  public appInfo: any = {};
  public newMessages = new Array(4);
  public newTasks = new Array(5);
  public newNotifications = new Array(5);
  countdownInterval: any;
  countdownValue: number = 0;
  isReleasenoteModalShown: boolean = false;

  constructor(
    private classToggler: ClassToggleService,
    private dataService: DataService,
        private websocketService: WebsocketService,
    public g: GlobalService
  ) {
    super();
  }

  toggleReleasenote() {
    this.g.executeFunction('TOGGLE_RELEASENOTE');
  }

  ngOnInit(): void {
    this.g.registerFunction('WS_SUBSCRIBE', () => {
      this.doSubscribe();
    });
    this.initWs();
    setTimeout(() => {
      this.appInfo ="";
    }, 1000);
  }

  initWs(): void {
    if (!this.websocketService.isWebSocketConnected()) {
      this.websocketService
        .initializeWebSocketConnection()
        .then(() => {
          this.doSubscribe();
        })
        .catch((error) => {
          this.g.serverStatus = 'DOWN';
          console.error('Error initializing WebSocket: ', error);
          // Handle error
        });
    }
  }

  ngOnDestroy() {
   
  }

  doSubscribe() {
    this.websocketService.subscribe('/topic/serverTime', (message: string) => {
      // Ambil health dan time untuk update status aplikasi
      const data = JSON.parse(message);
      if (data.health != null && data.health.length > 0) {
        let time = data.time;
        let health = data.health;
        let date = data.date;
        this.g.currentTime = time;
        this.g.currentDate = this.g.transformDate(date) || '';
        this.g.serverStatus = health;
        this.g.countdownValue = 2;
        this.g.statusEndOfMonth = data.statusEndOfMonth;
        this.g.statusPlanningOrder = data.statusPlanningOrder;
        this.g.statusBackupDb = data.statusBackupDb;
        this.checkTitleIfOffline(time.substring(time.length - 1, 1));
      } else {
        this.g.serverStatus = 'DOWN';
      }
    });
    this.websocketService.subscribe('/topic/outlet', (message: string) => {
      console.log('outlet: ' + message);
    });
  }

  checkTitleIfOffline(time: number) {
    const offlineText = 'OFFLINE - ';
    const title = this.g.getTitle();
    if (this.g.serverStatus === 'DOWN') {
      if ((time & 1) === 0 && !title.startsWith(offlineText)) {
        this.g.changeTitle(offlineText + title);
      } else {
        this.g.changeTitle(title.replace(offlineText, ''));
      }
    } else if (this.g.serverStatus === 'UP' && !title.startsWith(offlineText)) {
      this.g.changeTitle(title.replaceAll(offlineText, ''));
    }
  }
}
