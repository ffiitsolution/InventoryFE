import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';

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

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const isRight = event.clientX > window.innerWidth / 2;
    this.g.cursorSide = isRight ? 'right-half' : 'left-half';
  }

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
    // this.g.accessSidebar
    const permissionSet = new Set(
      this.g
        .getLocalstorage('inv_permissions')
        ?.filter((p: any) => p.app === 'SIDEBAR')
        ?.map((p: any) => p.permission)
    );

    this.translation.listMenuSidebar =
      this.translation.getCurrentLanguage() === 'id'
        ? menu_id
            .map((item: any) => {
              const filteredChildren = item.children
                ? item.children
                    .map((child: any) => {
                      const filteredGrandChildren = child.children
                        ? child.children.filter(
                            (grandChild: any) =>
                              grandChild.access &&
                              permissionSet.has(grandChild.access)
                          )
                        : [];

                      // Cek apakah child sendiri atau cucu punya akses
                      if (
                        (child.access && permissionSet.has(child.access)) ||
                        filteredGrandChildren.length > 0
                      ) {
                        return {
                          ...child,
                          children:
                            filteredGrandChildren.length > 0
                              ? filteredGrandChildren
                              : undefined,
                        };
                      }

                      return null;
                    })
                    .filter(Boolean)
                : [];

              // Cek apakah parent item punya akses atau salah satu anak punya akses
              if (
                (item.access && permissionSet.has(item.access)) ||
                filteredChildren.length > 0
              ) {
                return {
                  ...item,
                  children:
                    filteredChildren.length > 0 ? filteredChildren : undefined,
                };
              }

              return null;
            })
            .filter(Boolean)
        : menu_en;
  }

  updateSelectedNavItem(currentUrl: string) {
    console.log(currentUrl);
  }

  ngAfterViewInit() {
    this.navGroups = Array.from(document.querySelectorAll('.nav-group-toggle'));
    // this.navGroups.forEach((navGroup) => {
    //   navGroup.addEventListener('click', () => {
    //     this.toggleNavGroup(navGroup);
    //   });
    // });
    // Ketika menklik menu yang sedang dibuka, maka halaman refresh -- Permintaan UAT --
    const navLink = Array.from(document.getElementsByClassName('nav-link'));
    const htmlClass: any = [];
    const path: any[] = [];
    navLink.forEach((nav, index) => {
      const href: any = (nav as HTMLAnchorElement).getAttribute('href');
      let hClass: any = (nav as HTMLAnchorElement).getAttribute('class');
      if (href == '#' + this.router.url) {
        hClass += ' active';
        nav.setAttribute('class', hClass);
      }
      htmlClass[index] = hClass;
      path[index] = href ? href.replace('#', '') : '';
      nav.addEventListener('click', (event) => {
        this.g.saveLocalstorage('lastActU', path[index]);
        this.g.saveLocalstorage('lastActA', 'VIEW');
        if (!htmlClass[index].includes('nav-group-toggle')) {
          if (htmlClass[index].includes('active')) {
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigateByUrl(path[index]);
              });
          } else {
            for (let j = 0; j < htmlClass.length; j++) {
              const element = htmlClass[j];
              if (element.includes('active')) {
                htmlClass[j] = htmlClass[j].replace(' active', '');
                break;
              }
            }
            htmlClass[index] += ' active';
          }
        }
      });
    });
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
