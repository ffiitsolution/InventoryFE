import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../../service/app.service';
import { DataLocationShape, UserShape } from 'src/app/service/type';
import { isEmpty } from 'lodash-es';
import { GlobalService } from 'src/app/service/global.service';
import { TranslationService } from 'src/app/service/translation.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @ViewChild('usernameInput')
  usernameInput: ElementRef | undefined;

  @ViewChild('passwordInput')
  passwordInput: ElementRef | undefined;

  translate: string = 'id';
  redirectUrl: string = '';
  logingIn: boolean = false;
  searchingUsername: boolean = false;
  errorMessage: string = '';
  user: any = UserShape;
  subscription$: any;
  version: string = environment.VERSION;

  constructor(
    translate: TranslateService,
    private route: ActivatedRoute,
    private translation: TranslationService,
    private service: AppService,
    private g: GlobalService,
    private router: Router,
    private el: ElementRef
  ) {
    translate.use(g.getLocalstorage('inv_language') || 'id');
  }

  ngOnInit(): void {
    this.g.clearLocalstorage();
  }

  onLoginPressed() {
    if (
      !this.usernameInput?.nativeElement?.value ||
      !this.passwordInput?.nativeElement?.value
    ) {
      this.errorMessage = 'errorMessageUsernamePasswordRequired';
    } else {
      this.route.queryParams.subscribe((response: any) => {
        this.redirectUrl = response?.returnUrl ?? 'dashboard';
      });

      this.logingIn = true;
      this.translation.checkLanguage();
      const loginParam = {
        kodeUser: this.usernameInput?.nativeElement?.value,
        kodePassword: this.passwordInput?.nativeElement?.value,
      };

      this.service.login(loginParam).subscribe({
        next: (res) => {
          if (!res.success) {
            this.errorMessage = res.message;
          } else {
            const { locations, user, token } = res.data;
            const transformedUser = {
              ...user,
              defaultLocation: user.defaultLocation
                ? locations.find((item: any) => item.kodeLocation)
                : null,
            };
            this.g.saveLocalstorage('inv_locations', locations);
            this.g.saveLocalstorage('inv_currentUser', transformedUser);
            this.g.saveLocalstorage('inv_token', token);
            this.service.getListMenu().subscribe({
              next: (res) => {
                if (res) {
                  this.g.saveLocalstorage('inv_listMenu', res);
                }
                if (isEmpty(user.defaultLocation)) {
                  this.router.navigate(['account-setting']);
                } else {
                  this.router.navigate([this.redirectUrl]);
                }
              },
              error: (err) => {
                this.errorMessage = err.message;
                console.log(err.message);
              },
            });
          }
          this.logingIn = false;
        },
      });
    }
  }
  onUsernameChange() {
    this.errorMessage = '';
  }
  onPasswordChange() {
    this.errorMessage = '';
  }
}
