import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_RUTE } from 'src/constants';

@Component({
  selector: 'app-detail-rute',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class TableRuteDetailComponent   implements OnInit {
  myForm: FormGroup;
  adding: boolean = false;
  kodeGudang: any;
  selectedKodeOutlet: any[] = [];
  listKodeOutlet: any[] = [];
  allKodeOutlet: any[] = [];
  draggedIndex: number | null = null;
  sequence:any;
  detailData:any;
  configSelectKodeOutlet: any;
  submitted:boolean = false;
  showErrorToast:boolean = false;
  userData: any;
    baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService
  ) {
    // By Raymond 7 Juli 2025
    this.kodeGudang = this.g.getUserLocationCode();
    this.userData = this.service.getUserData();
    this.detailData = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_RUTE));
    this.getKodeOutletByNomorRute();
    
  }

  ngOnInit(): void {

    this.configSelectKodeOutlet = {
      ...this.baseConfig,
      placeholder: 'Pilih Kode Outlet',
      searchPlaceholder: 'Cari Kode Outlet',
      limitTo: this.listKodeOutlet.length,
    };

    console.log(this.detailData, "Edit");
    this.myForm = this.form.group({
    noRute: [{ value: this.detailData.nomorRute, disabled: true }, [Validators.required, Validators.maxLength(10),  Validators.pattern('^[0-9]+$')]],  // **only digits**]],
    namaRute: [{ value: this.detailData.namaRute, disabled: true }, [Validators.required, Validators.maxLength(100),    Validators.pattern('^[a-zA-Z0-9 ]+$')]],  // **letters, numbers, spaces** ]],
    status: [{ value: this.detailData.status, disabled: true }, [Validators.required]], // Default to 'A' (Active) as shown checked in template
    KodeOutlet: [{ value: this.selectedKodeOutlet, disabled: true }, [Validators.required]] // Array for multiple selection
  });
   


  }

  getKodeOutletByNomorRute(){
  
     const param = {
      nomorRute : this.detailData.nomorRute
    };
    this.service.getKodeOutletByNomorRute(param).subscribe({
      next: (response) => {
        // this.toastr.success('Berhasil Posting DO Balik');
        this.selectedKodeOutlet = response.data;

        this.selectedKodeOutlet = response.data.map((item: any) =>({
          name: item.kodeOutlet + ' - '  + item.namaCabang,
          seq: item.seq,
          value: item.kodeOutlet
        }));
        console.log(this.selectedKodeOutlet, "Selected Kode Outlet");

      },
      error: (error) => {
        this.toastr.error('Gagal posting');
      },
    });
  }
  
 

    

 

  
  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_RUTE);
    this.router.navigate(['/master/master-rute']);
  }




  
updateDropdownList() {
  this.listKodeOutlet = this.allKodeOutlet.filter(opt =>
    !this.selectedKodeOutlet.some(sel => sel.value === opt.value)
  );
  console.log(this.allKodeOutlet, "List ALL kode Outlet");
  console.log(this.listKodeOutlet, "List kode Outlet");
}
}





