import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '@coreui/angular';
import { isEmpty } from 'lodash-es';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { TimeService } from 'src/app/service/time.service';
import { TranslationService } from 'src/app/service/translation.service';
import { WebsocketService } from 'src/app/service/websocket.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class DefaultHeaderComponent
  extends HeaderComponent
  implements OnInit, OnDestroy
{
  @Input() sidebarId: string = 'sidebar';

  currentUser: any;
  isDefaultWarehouseExist: boolean = false;

  constructor(
    private router: Router,
    public g: GlobalService,
    private timeService: TimeService,
    private websocketService: WebsocketService,
    private translation: TranslationService,
    private service: AppService
  ) {
    super();
  }

  ngOnInit(): void {
    this.currentUser = this.g.getLocalstorage('inv_currentUser');
    this.g.currentUser = this.currentUser;
    if (!isEmpty(this.currentUser?.defaultLocation)) {
      this.isDefaultWarehouseExist = true;
    }

    this.g.registerFunction('WS_SUBSCRIBE', () => {
      this.doSubscribe();
    });
    this.initWs();
  }

  switchLanguage() {
    this.translation
      .switchLanguage(
        this.translation.getCurrentLanguage() === 'id' ? 'en' : 'id'
      )
      .then(() => {
        this.service.getListMenu().subscribe({
          next: (res) => {
            if (res) {
              this.g.saveLocalstorage('inv_listMenu', res);
              window.location.reload();
            }
          },
          error: (err) => alert(err),
        });
      });
  }

  onLogoutPressed() {
    this.g.clearLocalstorage();
    this.router.navigate(['/login']);
  }

  onAccountSettingPressed() {
    this.router.navigate(['account-setting']);
  }

  initWs(): void {
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

    this.timeService.currentTime$.subscribe((time) => {
      this.g.isFullscreen = !!document.fullscreenElement;
      if (this.g.countdownValue === 0) {
        // OFFLINE jika dari websocket tidak ada update
        this.g.serverStatus = 'DOWN';
      } else {
        this.g.countdownValue--;
      }
    });
  }

  ngOnDestroy() {
    this.websocketService.unsubscribe('/topic/serverTime');
    this.websocketService.unsubscribe('/topic/outlet');
  }

  sendWs() {
    this.websocketService.sendMessage('/app/outlet', 'tes hehe');
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
