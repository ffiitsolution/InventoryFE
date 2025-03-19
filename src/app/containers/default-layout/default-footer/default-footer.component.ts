import { Component } from '@angular/core';
import { FooterComponent } from '@coreui/angular';
import { environment } from '../../../../environments/environment';
import { GlobalService } from '../../../service/global.service';

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
