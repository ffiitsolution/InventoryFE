import { Component } from '@angular/core';
import { FooterComponent } from '@coreui/angular';
import { GlobalService } from 'src/app/service/global.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-default-footer',
  templateUrl: './default-footer.component.html',
  styleUrls: ['./default-footer.component.scss'],
})
export class DefaultFooterComponent extends FooterComponent {
  
  version: string = environment.VERSION;

  constructor(
    public g: GlobalService
  ) {
    super();
  }
}
