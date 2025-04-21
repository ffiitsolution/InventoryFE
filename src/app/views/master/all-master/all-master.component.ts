import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ACTION_ADD,
  ACTION_EDIT,
  ACTION_VIEW,
  LS_INV_SELECTED_UOM,
} from '../../../../constants';
import { Router } from '@angular/router';
import { Page } from '../../../model/page';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { AppService } from '../../../service/app.service';

@Component({
  selector: 'app-all-master',
  templateUrl: './all-master.component.html',
  styleUrl: './all-master.component.scss',
})
export class AllMasterComponent implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  page = new Page();
  data: any;
  loadingIndicator = true;
  selectedCategory: string = 'Master';
  verticalItemCount: number = 6;
  listMaster: any = [
    {
      name: 'User',
      url: '/master/master-user',
      iconComponent: 'cilUser',
    },
    {
      name: 'Cabang & Dept.',
      url: '/master/master-branch',
      iconComponent: 'cilHouse',
    },
    {
      name: 'Location',
      url: '/master/master-location',
      iconComponent: 'cilLocationPin',
    },
    {
      name: 'Supplier',
      url: '/master/master-supplier',
      iconComponent: 'cibCodesandbox',
    },
    {
      name: 'Barang',
      url: '/master/master-product',
      iconComponent: 'cilFastfood',
    },
    {
      name: 'RSC',
      url: '/master/master-rsc',
      iconComponent: 'cilContact',
    },
    {
      name: 'Regional',
      url: '/master/master-regional',
      iconComponent: 'cilMap',
    },
    {
      name: 'Area',
      url: '/master/master-area',
      iconComponent: 'cilLocationPin',
    },
    {
      name: 'Satuan',
      url: '/master/master-uom',
      iconComponent: 'cibDropbox',
    },
    {
      name: 'Wilayah Kota',
      url: '/master/master-city-area',
      iconComponent: 'cilGlobeAlt',
    },
    {
      name: 'Counter',
      url: '/master/master-set-number',
      iconComponent: 'cilWindow',
    },
    {
      name: 'Jabatan',
      url: '/master/master-position',
      iconComponent: 'cilContact',
    },
    {
      name: 'Resep Produksi',
      url: '/master/master-resep',
      iconComponent: 'cilDinner',
    },
  ];
  listSetupNoTransaksi: any[] = [];
  userData: any;
  loadingSetupNoTransaksi: boolean = false;
  currentPage = 1;

  constructor(
    private service: AppService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('All') +
        ' ' +
        this.translation.instant('Report') +
        ' - ' +
        this.g.tabTitle
    );
    this.userData = this.service.getUserData();
  }

  ngOnDestroy(): void {
    $.fn['dataTable'].ext.search.pop();
  }

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngAfterViewInit(): void {}

  getObjectKeys(obj: Object) {
    return Object.keys(obj);
  }

  navigateMaster(master: any) {
    this.router.navigate([master.url]);
  }

  onCategoryClick(category: any) {
    this.selectedCategory = category;
    if (category === 'Setup No Transaksi') {
      this.getSetupNoTransaksi();
    }
  }

  getSetupNoTransaksi() {
    this.loadingSetupNoTransaksi = true;
    this.service
      .insert('/api/setup-no-transaksi', {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
      })
      .subscribe({
        next: (res) => {
          this.listSetupNoTransaksi = res.data ?? [];
          this.loadingSetupNoTransaksi = false;
        },
        error: (error) => {
          console.log(error);
          this.loadingSetupNoTransaksi = false;
        },
      });
  }
}
