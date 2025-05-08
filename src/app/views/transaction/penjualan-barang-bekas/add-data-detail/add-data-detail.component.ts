import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  SimpleChanges,
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
  TIPE_PEMBAYARAN,
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
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-add-data-detail-penjualan-brg-bekas',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailPenjualanBrgBekasComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  headerData: any = JSON.parse(
    localStorage['headerData']
  );
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: Boolean = false;
  totalLength: number = 0;
  // listProductData: any[] = [];
  listEntryExpired: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page: number = 1;
  isShowModal: boolean = false;
  dtOptions: any = {};
  selectedRow: any[] = [];
  pageModal = new Page();
  dataUser: any = {};
  validationMessageList: any[] = [];
  validationMessageQtyPesanList: any[] = [];
  isShowModalExpired: boolean = false;
  isShowModalDelete: boolean = false;
  isShowModalPosting = false;
  indexDataDelete: any;
  selectedExpProduct: any = {};
  listCurrentPage: number = 1;
  totalLengthList: number = 1;
  totalFilteredExpired: any = '0.0';
  formPosting: any = {
    // subTotal: 0,
    // nilaiAdjustment: 0,
    // nilaiPenjualan: 0,
    // tipePembayaran: '',
    // displayTipePembayaran: '',
    // keteranganBayar: '',
    // persenPajak: ''
  }

  optionTipePembayaran: any;

  baseConfig: any = {
    displayKey: 'label', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => { }, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'label', // Key to search,
    placeholder: 'Pilih Tipe Pembayaran'
  };

  @ViewChild('formModal') formModal: any;
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-red',
  };
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
    this.g.navbarVisibility = false;
    this.headerData = JSON.parse(this.headerData);
    this.optionTipePembayaran = TIPE_PEMBAYARAN
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Pesanan') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const isCanceled = this.headerData.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.headerData.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.renderDataTables();

  }

  onChangeTipePembayaran(event: any) {
    const value = event.value;
    this.formPosting.displayTipePembayaran = `${value.value}. ${value.label}`
    this.formPosting.tipePembayaran = value.value
  }

  // Fungsi untuk parsing format ke number
  parseRupiahToNumber(formatted: string): number {
    const cleaned = formatted.replace(/[^\d]/g, ''); // hapus semua selain angka
    return parseInt(cleaned, 10) || 0;
  }

  // Fungsi saat input
  onInputHargaSatuan(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    // Jangan langsung convert di sini
    const numericValue = this.parseRupiahToNumber(rawValue);
    this.listProductData[index].hargaSatuan = numericValue; // tetap angka
  }

  // Fungsi saat blur (keluar dari input)
  onBlurHargaSatuan(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const numericValue = this.listProductData[index].hargaSatuan || 0;

    // Format angka jadi Rupiah saat blur
    input.value = this.g.convertToRupiah(numericValue.toString());
  }

  onInputValueItemDetail(event: any, index: number, type: string, qtyType: string) {
    if (this.listProductData[index].qtyPesanKecil > this.listProductData[index].konversi) {
      this.validationMessageList[index] = "QTY kecil harus < Konversi";
    }
    else {
      this.validationMessageList[index] = "";
    }

    if (this.listProductData[index].qtyPesanKecil != 0 || this.listProductData[index].qtyPesanBesar != 0) {
      this.validationMessageQtyPesanList[index] = ""
    }
    else {
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
    if (!this.isDataInvalid()) {
      // param for order Header
      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tipeTransaksi: "11",
        tglTransaksi: moment(this.headerData.tglTransaksi, "DD-MM-YYYY").format("D MMM YYYY"), // contoh "14 Apr 2025"
        supplier: this.headerData.supplier || "", // tambahkan supplier
        statusPosting: 'P',
        keterangan: this.headerData.keterangan || "",
        namaSaksi: this.headerData.namaSaksi || "",
        jabatanSaksi: this.headerData.jabatanSaksi || "",
        subTotal: this.formPosting.subTotal, // hitung total harga
        nilaiAdjustment: this.g.parseRupiahToNumber(this.formPosting.nilaiAdjustment) || 0,
        nilaiPenjualan: this.formPosting.nilaiPenjualan || 0, // sama dengan subTotal
        keteranganBayar: this.headerData.keteranganBayar || "", // tambahan dari header
        tipeBayar: this.formPosting.tipePembayaran, // default ke 1 kalau tidak ada
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        dateCreate: moment().format("D MMM YYYY"), // hari ini
        details: this.listProductData
          .filter(item => item.kodeBarang && item.kodeBarang.trim() !== '')
          .map((item, index) => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(this.headerData.tglTransaksi, "DD-MM-YYYY").format("D MMM YYYY"),
            tipeTransaksi: 11,
            kodeBarang: item.kodeBarang,
            konversi: item.konversi,
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            qtyBesar: item.qtyBesar || 0,
            qtyKecil: item.qtyKecil || 0,
            flagExpired: 'Y',
            totalQty: this.getTotalQtyJual(index),
            totalHarga: this.g.parseRupiahToNumber(this.getTotalPenjualanByItem(index)),
            hargaSatuan: item.hargaSatuan || 0,
            userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
          })),
      };


      Swal.fire({
        title: 'Apa Anda Sudah Yakin?',
        text: 'Pastikan data yang dimasukkan sudah benar!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Simpan!',
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          this.service.insert('/api/penjualan-brg-bekas/insert', param).subscribe({
            next: (res) => {
              if (!res.success) {
                this.toastr.error(res.message);
              } else {
                setTimeout(() => {
                  this.toastr.success("Data berhasil dibuat!");
                  this.onPreviousPressed();
                }, DEFAULT_DELAY_TIME);

              }
              this.adding = false;
            },
          });
        } else {
          this.toastr.info(' Penyimpanan dibatalkan');
        }
      });

    }

    else {
      this.toastr.error("Data tidak valid")
    }

  }

  onDeleteRow(kodeBarang: string, index: number) {
    const filteredEntries = this.listProductData.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );

    // Step 2: Find the actual index in the original list
    const realIndex = this.listProductData.findIndex(
      (entry) =>
        entry.kodeBarang === kodeBarang
    );

    // Step 3: Remove the entry only if realIndex is valid
    if (realIndex !== -1) {
      this.listProductData.splice(realIndex, 1);
    }

  }

  getTotalHarga(index: number, data: any) {
    return (this.helper.sanitizedNumber(data.qtyBesar) *
      data.konversi) + this.helper.sanitizedNumber(data.qtyKecil)
  }

  getTotalPenjualanByItem(index: number) {
    return this.g.convertToRupiah(this.listProductData[index].hargaSatuan * this.getTotalHarga(index, this.listProductData[index]));
  }

  onShowModal() {
    this.isShowModal = true;
  }

  onShowModalPosting() {
    this.getTotalPenjualan();
    this.isShowModalPosting = true
  }

  getTotalPenjualan(): number {
    this.formPosting.subTotal = this.listProductData.reduce((acc, item, index) => {
      const harga = this.listProductData[index].hargaSatuan || 0;
      const totalHarga = harga * this.getTotalHarga(index, item); // panggil getTotalHarga sebagai function
      return acc + totalHarga;
    }, 0);

    return this.formPosting.nilaiPenjualan = this.formPosting.subTotal;
  }

  getJumlahItem(): number {

    return this.listProductData.length;
  }

  onChangeAdjustment(event: Event, type: 'value' | 'pajak'): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.trim();

    if (!rawValue) {
      this.formPosting.nilaiAdjustment = 0;
      input.value = '';
      return;
    }

    const subTotal = parseFloat(this.formPosting.subTotal?.toString() || '0');

    if (type === 'pajak') {
      const pajakPersen = parseFloat(rawValue.replace('%', ''));
      const pajak = isNaN(pajakPersen) ? 0 : (subTotal * pajakPersen / 100);

      this.formPosting.persenPajak = rawValue;
      this.formPosting.nilaiAdjustment = pajak;
      this.formPosting.nilaiPenjualan = subTotal + pajak;
      this.formPosting.nilaiAdjustment = this.g.convertToRupiah(this.formPosting.nilaiAdjustment)

      input.value = isNaN(pajakPersen) ? '' : pajakPersen + '%';
    } else if (type === 'value') {
      this.formPosting.persenPajak = '';
      const operator = rawValue.charAt(0);
      const numericPart = parseFloat(rawValue.slice(1));
      const currentPenjualan = this.formPosting.subTotal || 0;

      let adjustment = 0;

      if ((operator === '+' || operator === '') && !isNaN(numericPart)) {
        adjustment = numericPart;
        this.formPosting.nilaiPenjualan = currentPenjualan + adjustment;
      } else if (operator === '-' && !isNaN(numericPart)) {
        adjustment = -numericPart;
        this.formPosting.nilaiPenjualan = currentPenjualan + adjustment;
      } else {
        const value = parseFloat(rawValue.replace(/[^\d.-]/g, ''));
        adjustment = isNaN(value) ? 0 : value;
        this.formPosting.nilaiPenjualan = isNaN(value) ? currentPenjualan : currentPenjualan + adjustment;
      }

      this.formPosting.nilaiAdjustment = adjustment;
    }
  }
  onBlurAdjustment(data: any): void {

    const value = data?.toString().trim() || '';

    if (value.toLowerCase().includes('rp')) {
      this.formPosting.nilaiAdjustment = value;
    } else {
      this.formPosting.nilaiAdjustment = this.g.convertToRupiah(value);
    }
  }

  validateDate(event: any, kodeBarang: string, index: number) {
    let inputDate: any = '';
    let source: string;
    let validationMessage = '';

    if (event?.target?.value) {
      inputDate = event.target.value;
      source = 'manual input';
    } else {
      inputDate = event;
      source = 'datepicker';
    }

    const expiredDate = moment(inputDate, 'DD/MM/YYYY').toDate();
    const today = new Date();

    if (expiredDate < today) {
      validationMessage = `Tanggal kadaluarsa tidak boleh lebih <= dari sekarang!`;
    }

    // ✅ Get only the filtered list of entries for the same `kodeBarang`
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );
    console.log('tgllist', filteredEntries);

    // ✅ Validate empty input
    if (!inputDate) {
      validationMessage = 'Tanggal tidak boleh kosong!';
    } else {
      // ✅ Check if the item is expired
      const expiredData = this.listEntryExpired.find(
        (exp) => exp.kodeBarang === kodeBarang
      );

      // ✅ Check for duplicate expiration dates within the same kodeBarang
      const isDuplicate = filteredEntries.some(
        (otherEntry, otherIndex) =>
          otherIndex !== index &&
          moment(otherEntry.tglExpired).format('YYYY-MM-DD') ===
          moment(expiredDate).format('YYYY-MM-DD')
      );

      if (isDuplicate) {
        validationMessage = 'Tanggal ini sudah ada dalam daftar!';
      }
    }

    const realIndex = this.listEntryExpired.findIndex(
      (entry) =>
        entry.kodeBarang === kodeBarang &&
        entry.tglExpired === filteredEntries[index].tglExpired
    );

    if (realIndex !== -1) {
      // ✅ Update the correct entry in the original list
      this.listEntryExpired[realIndex] = {
        ...this.listEntryExpired[realIndex],
        tglExpired: expiredDate, // Update the date in the list
        validationExpiredMessageList: validationMessage,
      };

      console.log('Updated Validation:', this.listEntryExpired[realIndex]);
    }
  }

  isValidQtyExpired: boolean = true;

  onSaveEntryExpired() {
    let totalQtyExpired = 0;

    const totalQty = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyBesar) *
      this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyKecil);

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.kodeBarang) {
        item.totalQty = (this.helper.sanitizedNumber(item.qtyBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyKecil);
        item.kodeBarang = this.selectedExpProduct.kodeBarang;
        totalQtyExpired += item.totalQty;
      }
    });


    if (totalQtyExpired > totalQty) {
      this.toastr.error("Total Qty Expired harus sama dengan Qty ");
    } else {
      this.isShowModalExpired = false;
    }
  }


  get filteredList() {
    return this.listEntryExpired.filter(
      (item) => item.kodeBarang === this.selectedExpProduct.kodeBarang
    );
  }


  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translationService.getCurrentLanguage() == 'id' ? this.translationService.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      lengthMenu: [5, 10, 25, 50, 100],
      pageLength: 5,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback:any) => {

        this.pageModal.start = dataTablesParameters.start;
        this.pageModal.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          defaultGudang: this.headerData?.kodeSingkat,
          // startDate: this.g.transformDate(this.dateRangeFilter[0]),
          // endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        // this.appService.getNewReceivingOrder(params)
        this.dataService
          .postData(this.g.urlServer + '/api/product/list-bekas', params)
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
            render: (data: any, _: any, row: any) => {
            let isChecked = this.selectedRow.some(item => item.kodeBarang === row.kodeBarang) ? 'checked' : '';
            return `<input type="checkbox" class="row-checkbox" data-id="${row.kodeBarang}" ${isChecked}>`;
          }
        },
        { data: 'kodeBarang', title: 'Kode Barang' },
        { data: 'namaBarang', title: 'Nama Barang' },
        { data: 'konversi', title: 'Konversi' },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'satuanBesar', title: 'Satuan Besar' },
        { data: 'defaultGudang', title: 'Default Gudang' },
        { data: 'statusAktif', title: 'Status Aktif', render: (data:any) => this.g.getStatusAktifLabel(data) },
      ],
      searchDelay: 1000,
      // delivery: [],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $(row).find('.row-checkbox').off('change').on('change', (event: JQuery.ChangeEvent<HTMLElement>) => {
          this.handleCheckboxChange(event, data);
        });

        $('td', row).on('click', (event) => {
          const checkbox = $(row).find('.row-checkbox');
          const index = this.selectedRow.findIndex(item => item === data);

          if (index === -1) {
            this.selectedRow.push(data);
            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
            checkbox.prop('checked', true);
          } else {
            this.selectedRow.splice(index, 1);
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

  handleCheckboxChange(event: JQuery.ChangeEvent<HTMLElement>, data: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    console.log("isChecked", isChecked)
    if (isChecked) {
      // Add kodeBarang if checked
      if (!this.selectedRow.some(item => item.kodeBarang === data.kodeBarang)) {
        this.selectedRow.push(data);
      }
    } else {
      // Remove kodeBarang if unchecked
      this.selectedRow = this.selectedRow.filter(item => item.kodeBarang !== data.kodeBarang);
      console.log("this.selectedRow else", this.selectedRow)
    }
    console.log("selectedRow", this.selectedRow)
  }

  onAddListDataBarang() {
    let errorMessage
    console.log("test")
    this.isShowModal = false;

    for (let barang of this.selectedRow) {
      console.log("barang", barang);

      if (!this.listProductData.some(order => order.kodeBarang === barang.kodeBarang)) {
        const productData = {
          totalQtyPesan: 0,
          qtyBesar: '0.00',
          namaBarang: barang?.namaBarang,
          satuanKecil: barang?.satuanKecil,
          kodeBarang: barang?.kodeBarang,
          satuanBesar: barang?.satuanBesar,
          konversi: barang?.konversi,
          qtyKecil: '0.00',
          isConfirmed: true,
          ...barang
        }
        this.listProductData.splice(this.listProductData.length - 1, 0, productData);
        //  this.validationMessageList.push("")
        //  this.validationMessageQtyPesanList.push("Quantity Pesan tidak Boleh 0")
        // this.mapOrderData(data);
        // this.onSaveData();
      }
      else {
        errorMessage = "Beberapa barang sudah ditambahkan"
      }
    }
    if (errorMessage)
      this.toastr.error(errorMessage);

  }

  deleteBarang() {
    this.listProductData.splice(this.indexDataDelete, 1);
    this.isShowModalDelete = false;
  }

  insertDetail() {
    // param for order header detail
    const paramDetail = this.listProductData.map(item => ({
      kodeGudang: this.headerData.kodeGudang,
      kodeTujuan: this.headerData.supplier,
      nomorPesanan: this.headerData.nomorPesanan,
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
          this.service.handleErrorResponse(res);
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
    this.router.navigate(['/transaction/penjualan-barang-bekas/list']);
  }

  isDataInvalid() {
    let dataInvalid = false;
    dataInvalid =
      this.validationMessageList.some(msg => msg.trim() !== "") ||
      this.validationMessageQtyPesanList.some(msg => msg.trim() !== "");

    return dataInvalid
  }

  listProductData: any[] = [
    { kodeBarang: '', namaBarang: '', konversi: '', satuanKecil: '', satuanBesar: '', qtyBesar: '', qtyKecil: '', isConfirmed: false }
  ];
  tempKodeBarang: string = '';

  handleEnter(event: any, index: number) {
    event.preventDefault();

    let kodeBarang = this.listProductData[index].kodeBarang?.trim();
    if (kodeBarang !== '') {
      this.getProductRow(kodeBarang, index);
    }
  }

  getTotalQtyJual(index: number) {
    return (this.helper.sanitizedNumber(this.listProductData[index].qtyBesar) *
      this.listProductData[index].konversi) + this.helper.sanitizedNumber(this.listProductData[index].qtyKecil)
  }

  getProductRow(kodeBarang: string, index: number) {
    let param = { kodeBarang: kodeBarang };

    if (kodeBarang !== '') {
      const isDuplicate = this.listProductData.some(
        (item, i) => item.kodeBarang === kodeBarang && i !== index
      );

      if (isDuplicate) {
        this.toastr.error("Barang sudah ditambahkan")
        return;
      }

      this.appService.getProductById(param).subscribe({
        next: (res) => {
          if (res) {
            this.listProductData[index].namaBarang = res.namaBarang;
            this.listProductData[index].satuanKecil = res.satuanKecil;
            this.listProductData[index].satuanBesar = res.satuanBesar;
            this.listProductData[index].konversi = res.konversi;
            this.listProductData[index].konversi = res.konversi;
            this.listProductData[index].qtyBesar = '0.00';
            this.listProductData[index].qtyKecil = '0.00';

            this.listProductData[index].isConfirmed = true;
            this.listProductData[index].isLoading = false;

            if (index === this.listProductData.length - 1) {
              this.listProductData.push({
                kodeBarang: '', namaBarang: '', konversi: '',
                satuanKecil: '', satuanBesar: '', isConfirmed: false,
                isLoading: false
              });
            }
          }
        },
      });
    }
  }

  onBlurQtyBesar(index: number) {
    const value = this.listProductData[index].qtyBesar;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listProductData[index].qtyBesar = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listProductData[index].qtyBesar = '0.00'; // fallback if input is not a number
    }
  }

  onBlurQtyKecil(index: number) {
    const value = this.listProductData[index].qtyKecil;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listProductData[index].qtyKecil = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listProductData[index].qtyKecil = '0.00'; // fallback if input is not a number
    }
  }

}
