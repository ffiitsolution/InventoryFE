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
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { WebsocketService } from '../../../service/websocket.service';
import { AppService } from '../../../service/app.service';
import { menu_id } from '../default-sidebar/id';
import { menu_en } from '../default-sidebar/en';

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
    const currentLang = this.translation.getCurrentLanguage();
    this.translation
      .switchLanguage(currentLang === 'id' ? 'en' : 'id')
      .then(() => {
        this.translation.listMenuSidebar =
          currentLang === 'id' ? menu_en : menu_id;
        window.location.reload();
        // Jika ingin menggunakan menu dari API/DB
        // this.service.getListMenu().subscribe({
        //   next: (res) => {
        //     if (res) {
        //       this.g.saveLocalstorage('inv_listMenu', res);
        //       window.location.reload();
        //     }
        //   },
        //   error: (err) => alert(err),
        // });
      });
  }

  onLogoutPressed() {
    this.g.clearLocalstorage();
    this.router.navigate(['/login']);
  }

  onAccountSettingPressed() {
    this.router.navigate(['account-setting']);
  }

  onProfileCompanyPressed() {
    this.router.navigate(['master/profile-company']);
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
