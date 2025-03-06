import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslationService } from 'src/app/service/translation.service';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_DELIVERY_ORDER,
  OUTLET_BRAND_KFC,
  SEND_PRINT_STATUS_SUDAH,
  STATUS_SAME_CONVERSION,
  ACTION_SELECT
} from '../../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AppConfig } from '../../../../config/app.config';

import { HelperService } from '../../../../service/helper.service';
import { AppService } from '../../../../service/app.service';
import moment from 'moment';
import { data } from 'jquery';

@Component({
  selector: 'app-add-data-detail-send-order-to-warehouse',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailSendOrderToWarehouseComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  newOrhdk: any = (localStorage.getItem('TEMP_ORDHDK') || '{}'  );
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: Boolean = false;
  totalLength: number = 0;
  listOrderData: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page: number = 1;
  isShowModal: boolean = false;
  dtOptions: DataTables.Settings = {};
  selectedRow:  any = {};
  pageModal = new Page();
  dataUser: any = {};
  validationMessageList: any[] = [];
  validationMessageQtyPesanList: any[] = [];

  isShowModalDelete: boolean = false;
  indexDataDelete : any;
  isShowModalOnSubmit: boolean = false;
  barangTemp: any[] = []; 
  isShowModalCancel: boolean = false;

  @ViewChild('formModal') formModal: any;


  protected config = AppConfig.settings.apiServer;

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private dataService: DataService,
    private service: AppService,

  ) {
    this.g.navbarVisibility = true;
    this.newOrhdk = JSON.parse(this.newOrhdk);
    this.getDeliveryItemDetails()
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Pesanan') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const isCanceled = this.newOrhdk.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.newOrhdk.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.renderDataTables();



  }
  

  getDeliveryItemDetails() {
    this.loading = true;
    this.listOrderData = [];

    const params = {
      nomorPesanan: this.newOrhdk.nomorPesanan
    };

  //   this.listOrderData = [
  //     {
  //       totalQtyPesan: 0,
  //       qtyPesanBesar: 5,
  //       namaBarang: "DAGING SAPI SLICE",
  //       satuanKecil: "PCS",
  //       kodeBarang: "02-2001",
  //       satuanBesar: "KG",
  //       konversi: 5,
  //       qtyPesanKecil: 10
  //     }
  // ];
  }

  onInputValueItemDetail(event: any, index: number, type: string, qtyType: string) {
    // const target = event.target;
    // const value = target.value;
    let validationMessage = '';


    if(this.listOrderData[index].qtyPesanKecil > this.listOrderData[index].konversi  ){
      this.validationMessageList[index] = "QTY kecil harus < Konversi";
    }
    else{
      this.validationMessageList[index] = "";
    }

    if(this.listOrderData[index].qtyPesanKecil!=0 || this.listOrderData[index].qtyPesanBesar!=0){
      this.validationMessageQtyPesanList[index] = ""
    }
    else{
      this.validationMessageQtyPesanList[index] = "Quantity Pesan tidak Boleh 0"
    }
  }
  onFilterSearch(
    listData: any[],
    filterText: string,
    startAfter: number = 1
  ): any[] {
    return this.helper.applyFilterList(listData, filterText, startAfter);
  }

  ngAfterViewInit(): void {

  }
  ngOnDestroy(): void {
    this.g.navbarVisibility = true;
  }

  onBackPressed() {
    this.router.navigate(['/order/send-order-to-warehouse/add']);
  }


  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");
  }

  onSubmit() {
    if(!this.isDataInvalid()){
      // param for order Header
      const paramHeader = this.newOrhdk;
        
      this.service.insert('/api/send-order-to-warehouse/insert-header', paramHeader).subscribe({
        next: (res) => {
          if (!res.success) {
            alert(res.message);
          } else {
            this.newOrhdk.nomorPesanan =  res.item?.[0]?.nomorPesanan ;

            this.insertDetail()
            setTimeout(() => {
              this.onPreviousPressed();
            }, DEFAULT_DELAY_TIME);
            
          }
          this.adding = false;
        },
      });

    }

    else{
      this.toastr.error("Data tidak valid")
    }
   
  }
  
  onShowModal() {
    this.isShowModal = true;
  }

  onShowModalDelete(i: any) {
    this.indexDataDelete = i;
    this.isShowModalDelete = true;
  }

  onShowModalOnSubmit() {
    this.isShowModalOnSubmit = true;
  }
  onShowModalCancel() {
    this.isShowModalCancel= true;
  }
  
  onCancelPressed() {
    window.location.reload();
  }

  onAddListDataBarang(){
    let errorMessage
    console.log("test")
    this.isShowModal = false;
    
    for (let barang of this.barangTemp) {
        console.log("barang",barang);

      if(!this.listOrderData.some(order => order.kodeBarang === barang.kodeBarang)){
        this.listOrderData.push({
          totalQtyPesan: 0,
          qtyPesanBesar: 0,
          namaBarang:  barang?.namaBarang,
          satuanKecil:barang?.satuanKecil,
          kodeBarang:barang?.kodeBarang,
          satuanBesar: barang?.satuanBesar,
          konversi: barang?.konversi,
          qtyPesanKecil: 0,
          ...barang
        });
        this.validationMessageList.push("")
        this.validationMessageQtyPesanList.push("Quantity Pesan tidak Boleh 0")
          // this.mapOrderData(data);
          // this.onSaveData();
      }
      else{
          errorMessage = "Beberapa barang sudah ditambahkan"
      }
    }
    if(errorMessage)
      this.toastr.error(errorMessage);

  }

  
  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translationService.getCurrentLanguage() == 'id' ? this.translationService.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback) => {
        this.pageModal.start = dataTablesParameters.start;
        this.pageModal.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          defaultGudang: this.newOrhdk?.kodeSingkat,
          // startDate: this.g.transformDate(this.dateRangeFilter[0]),
          // endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        // this.appService.getNewReceivingOrder(params)
        this.dataService
        .postData(this.g.urlServer + '/api/product/dt-pesanan', params)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.pageModal.start + index + 1,
                // kodePemesan: `(${rest.kodeGudang}) ${rest.namaGudang}`,
                // tglPesan: this.g.transformDate(rest.tglPesan),
                // tglKirim: this.g.transformDate(rest.tglKirim),
                // tglKadaluarsa: this.g.transformDate(rest.tglKadaluarsa),
              };
              return finalData;
            });
            this.pageModal.recordsTotal = resp.recordsTotal;
            this.pageModal.recordsFiltered = resp.recordsFiltered;
            // this.showFilterSection = false;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        {
          title: 'Pilih Barang  ',
          className: 'text-center',
          render: (data, type, row) => {
            let isChecked = this.barangTemp.some(item => item.kodeBarang === row.kodeBarang) ? 'checked' : '';
            return `<input type="checkbox" class="row-checkbox" data-id="${row.kodeBarang}" ${isChecked}>`;
        }
        
      },
        { data: 'kodeBarang', title: 'Kode Barang', orderable: true},
        { data: 'namaBarang', title: 'Nama Barang', orderable: true },
        { data: 'konversi', title: 'Konversi', orderable: true },
        { data: 'satuanKecil', title: 'Satuan Kecil', orderable: true },
        { data: 'satuanBesar', title: 'Satuan Besar', orderable: true },
        { data: 'defaultGudang', title: 'Default Gudang', orderable: true },
        { data: 'flagConversion', 
          title: 'Conversion Factor',
          render: (data, type, row) => {
            if (data === 'T') 
              return "Tidak";
            else if (data === 'Y') 
              return "Ya";
          
            else
              return data
          }, 
          orderable: true
        },
        { data: 'statusAktif', 
          title: 'Status Aktif',
          render: (data, type, row) => {
            if (data === 'T') 
              return "Inactive";
            else if (data === 'A') 
              return "Active";
          
            else
              return data
          },
          orderable: true
         },
        

      ],
      searchDelay: 1000,
      // order: [
      //   [8, 'desc'],
      // ],
      // delivery: [],
      rowCallback: (row: Node, data: any, index: number) => {
   

        // Handle Checkbox Click
        // $('.row-checkbox', row).on('change', function () {
        //   let totalCheckboxes = $('.row-checkbox').length;
        //   let checkedCheckboxes = $('.row-checkbox:checked').length;

        //   // If all row checkboxes are checked, check "Select All", otherwise uncheck
        //   $('#selectAllCheckbox').prop('checked', totalCheckboxes === checkedCheckboxes);
        //   console.log("row",row);
        //   console.log("data",data);
        // });

        // Handle Checkbox Click
        $(row).find('.row-checkbox').off('change').on('change', (event: JQuery.ChangeEvent<HTMLElement>) => {
            this.handleCheckboxChange(event , data);
        });

        $('td', row).on('click', (event) => {
          const checkbox = $(row).find('.row-checkbox'); 
          const index = this.barangTemp.findIndex(item => item === data);

          if (index === -1) {
            this.barangTemp.push(data);
            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
            checkbox.prop('checked', true);
          } else {
            this.barangTemp.splice(index, 1);
            $('td', row).css({ 'background-color': '' }).removeClass('bg-secondary bg-opacity-25 fw-semibold');
            checkbox.prop('checked', false);
          }
          if ($(event.target).is('.select-row')) {
            event.stopPropagation();
          }
        });

        return row;
      },
    };
  }
  
 
  deleteBarang() {
    this.listOrderData.splice(this.indexDataDelete, 1);
    this.isShowModalDelete = false;
  }

  insertDetail(){
    // param for order header detail
    const paramDetail = this.listOrderData.map(item => ({
      kodeGudang: this.newOrhdk.kodeGudang,
      kodeTujuan: this.newOrhdk.supplier,
      nomorPesanan: this.newOrhdk.nomorPesanan,
      kodeBarang: item.kodeBarang,
      konversi: item.konversi,
      satuanKecil: item.satuanKecil,
      satuanBesar: item.satuanBesar,
      qtyPesanBesar: item.qtyPesanBesar,
      qtyPesanKecil: item.qtyPesanKecil,
      totalQtyPesan: (this.helper.sanitizedNumber(item.qtyPesanBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyPesanKecil),
      hargaUnit: item.unitPrice
  }));


  this.service.insert('/api/send-order-to-warehouse/insert-detail', paramDetail).subscribe({
    next: (res) => {
      if (!res.success) {
        alert(res.message);
      } else {
        
        this.toastr.success('Berhasil!');
        // setTimeout(() => {
        //   this.onPreviousPressed();
        // }, DEFAULT_DELAY_TIME);
        
      }
      this.adding = false;
    },
  });
  


  }

  onPreviousPressed(): void {
    this.router.navigate(['order/send-order-to-warehouse']);
  }

  isDataInvalid() {
    let dataInvalid = false;
    dataInvalid = 
    this.validationMessageList.some(msg => msg.trim() !== "") || 
    this.validationMessageQtyPesanList.some(msg => msg.trim() !== "")||
    this.listOrderData.length === 0;

    if(this.listOrderData.length === 0){
      this.toastr.error("Data kosong")
    }
    
    return dataInvalid
  }


  handleCheckboxChange(event: JQuery.ChangeEvent<HTMLElement>, data: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    console.log("isChecked",isChecked)
    if (isChecked) {
        // Add kodeBarang if checked
        if (! this.barangTemp.some(item => item.kodeBarang === data.kodeBarang)) {
            this.barangTemp.push(data);
        }
    } else {
        // Remove kodeBarang if unchecked
        this.barangTemp = this.barangTemp.filter(item => item.kodeBarang !== data.kodeBarang);
        console.log("this.barangTemp else",this.barangTemp)
    }
    console.log("barangTemp",this.barangTemp)
  }

}
