import { AfterViewInit, Component, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';
import { INavData } from '@coreui/angular';
import { GlobalService } from '../../service/global.service';
import { menu_id } from './default-sidebar/id';
import { menu_en } from './default-sidebar/en';
import { TranslationService } from '../../service/translation.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent implements OnInit, AfterViewInit {
  public perfectScrollbarConfig = {
    suppressScrollX: true,
  };

  public sidebarMinimized = false;
  private changes: MutationObserver;
  public element: HTMLElement = document.body;

  dataUser: any;
  loading = false;
  dataOutlet: any;

  navGroups: HTMLElement[] = [];

  previousUrl: string = '';
  currentUrl: string = '';

  constructor(
    public g: GlobalService,
    private router: Router,
    public translation: TranslationService
  ) {
    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized =
        document.body.classList.contains('sidebar-minimized');
    });

    this.changes.observe(<Element>this.element, {
      attributes: true,
      attributeFilter: ['class'],
    });

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      }
    });
  }

  ngOnInit() {
    this.dataOutlet = this.g.getLocalstorage('inv_outletData');
    this.dataUser = this.g.getLocalstorage('inv_currentUser');
    this.translation.listMenuSidebar =
      this.translation.getCurrentLanguage() === 'id' ? menu_id : menu_en;
  }

  updateSelectedNavItem(currentUrl: string) {
    console.log(currentUrl);
  }

  ngAfterViewInit() {
    // this.navGroups = Array.from(document.querySelectorAll('.nav-group-toggle'));
    // this.navGroups.forEach((navGroup) => {
    //   navGroup.addEventListener('click', () => {
    //     this.toggleNavGroup(navGroup);
    //   });
    // });
    // Ketika menklik menu yang sedang dibuka, maka halaman refresh -- Permintaan UAT --
    // const navLink = Array.from(document.getElementsByClassName('nav-link'));
    // const htmlClass: any = [];
    // const path: any[] = [];
    // navLink.forEach((nav, index) => {
    //   const href: any = (nav as HTMLAnchorElement).getAttribute('href');
    //   let hClass: any = (nav as HTMLAnchorElement).getAttribute('class');
    //   if (href == '#' + this.router.url) {
    //     hClass += ' active';
    //     nav.setAttribute('class', hClass);
    //   }
    //   htmlClass[index] = hClass;
    //   path[index] = href ? href.replace('#', '') : '';
    //   nav.addEventListener('click', (event) => {
    //     this.g.saveLocalstorage('lastActU', path[index]);
    //     this.g.saveLocalstorage('lastActA', 'VIEW');
    //     if (!htmlClass[index].includes('nav-group-toggle')) {
    //       if (htmlClass[index].includes('active')) {
    //         this.router
    //           .navigateByUrl('/', { skipLocationChange: true })
    //           .then(() => {
    //             this.router.navigateByUrl(path[index]);
    //           });
    //       } else {
    //         for (let j = 0; j < htmlClass.length; j++) {
    //           const element = htmlClass[j];
    //           if (element.includes('active')) {
    //             htmlClass[j] = htmlClass[j].replace(' active', '');
    //             break;
    //           }
    //         }
    //         htmlClass[index] += ' active';
    //       }
    //     }
    //   });
    // });
  }

  toggleNavGroup(clickedNavGroup: HTMLElement) {
    const parentNavGroup = clickedNavGroup.closest('.nav-group') as HTMLElement;
    const isOpened = parentNavGroup.classList.contains('opened');
    this.navGroups.forEach((navGroup) => {
      if (navGroup !== clickedNavGroup) {
        this.hideNavGroup(navGroup);
      }
    });
    if (!isOpened) {
      this.showNavGroup(clickedNavGroup);
    } else {
      this.hideNavGroup(clickedNavGroup);
    }
  }

  showNavGroup(navGroup: HTMLElement) {
    const parentNavGroup = navGroup.closest('.nav-group') as HTMLElement;
    parentNavGroup.classList.add('show');
    parentNavGroup.classList.add('opened');
    const siblingNavItem = parentNavGroup.querySelector(
      '.nav-group-items'
    ) as HTMLElement;
    if (siblingNavItem) {
      siblingNavItem.style.height = 'auto';
      siblingNavItem.style.display = 'block';
    }
  }

  hideNavGroup(navGroup: HTMLElement) {
    const parentNavGroup = navGroup.closest('.nav-group') as HTMLElement;
    parentNavGroup.classList.remove('show');
    parentNavGroup.classList.remove('opened');
    const siblingNavItem = parentNavGroup.querySelector(
      '.nav-group-items'
    ) as HTMLElement;
    if (siblingNavItem) {
      siblingNavItem.style.height = '0px';
      siblingNavItem.style.display = 'none';
    }
  }
}
