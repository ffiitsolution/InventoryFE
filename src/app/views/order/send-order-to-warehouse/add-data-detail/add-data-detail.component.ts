import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
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
  listOrderData: any[] =[];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page: number = 1;
  isShowModal: boolean = false;
  dtOptions: DataTables.Settings = {};
  selectedRow:  any = {};
  pageModal = new Page();
  dataUser: any = {};
  validationMessageListSatuanKecil: any[] = [];
  validationMessageListSatuanBesar: any[] = [];
  validationMessageQtyPesanList: any[] = [];

  isShowModalDelete: boolean = false;
  indexDataDelete : any;
  isShowModalOnSubmit: boolean = false;
  barangTemp: any[] = [];
  isShowModalCancel: boolean = false;

  listCurrentPage: number = 1;
  itemsPerPage: number = 5;
  searchListViewOrder: string = '';

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
    this.getSendWarehousetemDetails()
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


  getSendWarehousetemDetails() {
    this.loading = true;
    this.listOrderData = [{kodeBarang:"",namaBarang:""}];

  }

  onInputValueItemDetail(event: any, index: number, type: string, qtyType: string) {
    // const target = event.target;
    // const value = target.value;
    let validationMessage = '';



    if (this.isNotNumber(this.listOrderData[index].qtyPesanKecil)) {
      this.validationMessageListSatuanKecil[index] = "QTY kecil harus angka";
    }

    else if(this.listOrderData[index].qtyPesanKecil > this.listOrderData[index].konversi  ){
      this.validationMessageListSatuanKecil[index] = "QTY kecil harus < Konversi";
    }
    else{
      this.validationMessageListSatuanKecil[index] = "";
    }

    if (this.isNotNumber(this.listOrderData[index].qtyPesanBesar)) {
      this.validationMessageListSatuanBesar[index] = "QTY besar harus angka";
    }
    else{
      this.validationMessageListSatuanBesar[index] = "";
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
    this.isShowModalOnSubmit = false;
    if (this.listOrderData[this.listOrderData.length - 1].namaBarang.trim() === "") {
      this.listOrderData.splice(this.listOrderData.length - 1, 1);
    }
    if(!this.isDataInvalid()){
      // param for order Header
      const paramHeaderDetail = this.newOrhdk;

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

      paramHeaderDetail.listBarang = paramDetail;

      console.log("paramHeader",paramHeaderDetail)

      this.service.insert('/api/send-order-to-warehouse/insert-header-detail', paramHeaderDetail).subscribe({
        next: (res) => {
          if (!res.success) {
            this.service.handleErrorResponse(res);
          } else {
            this.toastr.success('Berhasil!');
            setTimeout(() => {
              this.onPreviousAfterSubmitPressed(res);
            }, DEFAULT_DELAY_TIME);

          }
          this.adding = false;
        },
      });

    }

    else{
      this.toastr.error("Data tidak valid")
    }

    if (this.listOrderData[this.listOrderData.length - 1].namaBarang.trim() !== "") {
      this.listOrderData.push({
        kodeBarang: '',
        namaBarang: '',
      });
    }
  }

  onShowModal() {
    this.barangTemp = []; // Reset selected items



    setTimeout(() => {
        $('#listBarangTable tbody tr').each(function () {
          $(this).find('td').removeClass('bg-secondary bg-opacity-25 fw-semibold'); // Remove styling from <td>
          $(this).find('.row-checkbox').prop('checked', false); // Uncheck all checkboxes
        });
    }, 0);

    this.isShowModal = true;
}


  onShowModalDelete(i: any) {
    this.indexDataDelete = i;
    this.isShowModalDelete = true;
  }

  onShowModalOnSubmit() {
       Swal.fire({
        ...this.g.componentKonfirmasiSimpan,
          showConfirmButton: false,
          showCancelButton: false,
          width: '600px',
          customClass: {
            popup: 'custom-popup'
          },
          didOpen: () => {
            const submitBtn = document.getElementById('btn-submit');
            const cancelBtn = document.getElementById('btn-cancel');
    
            submitBtn?.addEventListener('click', () => {
              this.onSubmit()
              Swal.close();
            });
    
            cancelBtn?.addEventListener('click', () => {
              Swal.close();
              this.adding = false
            });
          }
        })
  }
  onShowModalCancel() {
    this.isShowModalCancel= true;
  }

  onCancelPressed() {
    window.location.reload();
  }

  onAddListDataBarang(){
    let errorMessage
    this.isShowModal = false;

    if(this.listOrderData.length !== 0){
      if (this.listOrderData[this.listOrderData.length - 1].namaBarang.trim() === "") {
        // If the name is empty or contains only whitespace, remove the last item
        this.listOrderData.splice(this.listOrderData.length - 1, 1);
      }
    }

    for (let barang of this.barangTemp) {

      if(!this.listOrderData.some(order => order.kodeBarang === barang.kodeBarang)){
        this.listOrderData.push({
          totalQtyPesan:(0).toFixed(2),
          qtyPesanBesar: (0).toFixed(2),
          namaBarang:  barang?.namaBarang,
          satuanKecil:barang?.satuanKecil,
          kodeBarang:barang?.kodeBarang,
          satuanBesar: barang?.satuanBesar,
          konversi: barang?.konversi,
          qtyPesanKecil: (0).toFixed(2),
          ...barang
        });
        this.validationMessageListSatuanKecil.push("")
        this.validationMessageQtyPesanList.push("Quantity Pesan tidak Boleh 0")
        this.validationMessageListSatuanBesar.push("")
          // this.mapOrderData(data);
          // this.onSaveData();
      }
      else{
          errorMessage = "Beberapa barang sudah ditambahkan"
      }
    }
    if(errorMessage)
      this.toastr.error(errorMessage);


    if (this.listOrderData[this.listOrderData.length - 1].namaBarang.trim() !== "") {
      this.listOrderData.push({
        kodeBarang: '',
        namaBarang: '',
      });
    }
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
        };
        this.dataService
        .postData(this.g.urlServer + '/api/product/dt-pesanan', params)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.pageModal.start + index + 1,
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
        // { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        {
          data: 'dtIndex',
          title: 'Pilih Barang  ',
          className: 'text-center',
/*************  ✨ Codeium Command ⭐  *************/
/**
 * Generates the HTML for a checkbox input element for a data table row.
 * The checkbox is checked if the item's `kodeBarang` is present in `barangTemp`.
 * The checkbox is disabled if the item's `statusAktif` is 'T'.
 *
 * @param data - Data associated with the row.
 * @param type - The type of data (not used in this function).
 * @param row - The data object for the current row, which contains `kodeBarang` and `statusAktif`.
 * @returns A string representing the HTML of the checkbox input element.
 */

/******  a1b4e543-9620-4dcc-a7df-c90362bb4476  *******/
          render: (data, type, row) => {
            let isChecked = this.barangTemp.some(item => item.kodeBarang === row.kodeBarang) ? 'checked' : '';
            if(row.statusAktif === 'T'){
              return `<input type="checkbox" class="row-checkbox" data-id="${row.kodeBarang}" ${isChecked} disabled>`;

            }
            return `<input type="checkbox" class="row-checkbox" data-id="${row.kodeBarang}" ${isChecked}>`;
          },
          searchable: false,
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
      searchDelay: 1500,
      order: [
        [8, 'asc'], [1, 'asc'],
      ],
      // delivery: [],
      rowCallback: (row: Node, data: any, index: number) => {

        // Handle Checkbox Click
        $(row).find('.row-checkbox').off('change').on('change', (event: JQuery.ChangeEvent<HTMLElement>) => {
            this.handleCheckboxChange(event , data);
        });

        // handle row click
        $('td', row).on('click', (event) => {
          if(data.statusAktif !== 'T'){
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
          }
        });

        return row;
      },

    };
  }


  deleteBarang() {
    this.listOrderData.splice(this.indexDataDelete, 1);

    this.validationMessageListSatuanKecil.splice(this.indexDataDelete, 1);
    this.validationMessageQtyPesanList.splice(this.indexDataDelete, 1);
    this.validationMessageListSatuanBesar.splice(this.indexDataDelete, 1);

    this.isShowModalDelete = false;
  }

  onPreviousPressed(): void {
    this.router.navigate(['order/send-order-to-warehouse']);
  }

  onPreviousAfterSubmitPressed(res: any): void {
    // Simpan data ke sessionStorage agar bisa dibaca saat reload
    const stateData = {
      showModal: true,
      userCetak: this.dataUser.kodeUser,
      nomorPesanan: res.item[0].nomorPesanan,
      kodeCabang: res.item[0].kodeGudang,
      statusCetak: res.item[0].statusCetak,
    };


    sessionStorage.setItem('sendOrderState', JSON.stringify(stateData));

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['order/send-order-to-warehouse/add']);
    });
  }



  isDataInvalid() {
    let dataInvalid = false;
    dataInvalid =
    this.validationMessageListSatuanKecil.some(msg => msg.trim() !== "") ||
    this.validationMessageQtyPesanList.some(msg => msg.trim() !== "")||
    this.validationMessageListSatuanBesar.some(msg => msg.trim() !== "")||
    this.listOrderData.length === 0;

    if(this.listOrderData.length === 0){
      this.toastr.error("Data kosong")
    }

    return dataInvalid
  }


  handleCheckboxChange(event: JQuery.ChangeEvent<HTMLElement>, data: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
        // Add kodeBarang if checked
        if (! this.barangTemp.some(item => item.kodeBarang === data.kodeBarang)) {
            this.barangTemp.push(data);
        }
    } else {
        // Remove kodeBarang if unchecked
        this.barangTemp = this.barangTemp.filter(item => item.kodeBarang !== data.kodeBarang);
    }
  }

  isNotNumber(value: any){
    return !/^\d+(\.\d+)?$/.test(value)
  }

  handleEnter(event: any, index: number) {
    event.preventDefault();

    let kodeBarang = this.listOrderData[index].kodeBarang?.trim();
    if (kodeBarang !== '') {
      this.getProductRow(kodeBarang, index);
    }
  }

  getProductRow(kodeBarang: string, index: number) {
    let errorMessage
    let param = { kodeBarang: kodeBarang, defaultGudang:  this.newOrhdk?.kodeSingkat };

    if (kodeBarang !== '') {
      const isDuplicate = this.listOrderData.some(
        (item, i) => item.kodeBarang === kodeBarang && i !== index
      );

      if (isDuplicate) {
        this.toastr.error("Barang sudah ditambahkan")
        return;
      }

      this.appService.getProductById(param).subscribe({
        next: (res) => {
          if (res) {
            this.listOrderData[index].namaBarang = res.namaBarang;
            this.listOrderData[index].satuanKecil = res.satuanKecil;
            this.listOrderData[index].satuanBesar = res.satuanBesar;
            this.listOrderData[index].konversi = res.konversi;

            this.listOrderData[index].isConfirmed = true;
            this.listOrderData[index].isLoading = false;

            this.listOrderData[index].totalQtyPesan = (0).toFixed(2);
            this.listOrderData[index].qtyPesanKecil = (0).toFixed(2);
            this.listOrderData[index].qtyPesanBesar = (0).toFixed(2);

            // Add new properties to the object
            this.listOrderData[index] = {
              ...this.listOrderData[index],
              ...res
            };


            if (index === this.listOrderData.length - 1) {
              this.listOrderData.push({
                kodeBarang: '',
                namaBarang: '',
              });
            }
            this.validationMessageListSatuanKecil.push("")
            this.validationMessageQtyPesanList.push("Quantity Pesan tidak Boleh 0")
            this.validationMessageListSatuanBesar.push("")
              // this.mapOrderData(data);
              // this.onSaveData();


          }
        },
      });
    }
  }



  onBlurQtyPesanKecil(index: number) {
    const value = this.listOrderData[index].qtyPesanKecil;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listOrderData[index].qtyPesanKecil = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listOrderData[index].qtyPesanKecil = '0.00'; // fallback if input is not a number
      this.validationMessageListSatuanKecil[index] = "";
    }
  }

  onBlurQtyPesanBesar(index: number) {
    const value = this.listOrderData[index].qtyPesanBesar;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listOrderData[index].qtyPesanBesar = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listOrderData[index].qtyPesanBesar = '0.00'; // fallback if input is not a number
      this.validationMessageListSatuanBesar[index] = "";

    }
  }


  onFilterTextChange(newValue: string) {
    this.listCurrentPage = 1;
    if (newValue.length >= 3) {
      this.totalLength = 1;
    } else {
      this.totalLength = this.listOrderData.length;
    }
    this.listCurrentPage = this.listCurrentPage;
  }

    get filteredList() {
    if (!this.searchListViewOrder) {
      return this.listOrderData;
    }
    const searchText = this.searchListViewOrder.toLowerCase();
    return this.listOrderData.filter(item =>
      JSON.stringify(item).toLowerCase().includes(searchText)
    );
  }

  getPaginationIndex(i: number): number {
    return (this.listCurrentPage - 1) * this.itemsPerPage + i;
  }

  getJumlahItem(): number {
    if (this.filteredList.length === 0) {
      return 0;
    }
    if (this.filteredList[this.filteredList.length - 1].namaBarang.trim() === "") {
      return this.filteredList.length - 1;
    }
    return this.filteredList.length;
  }
  
  
}
