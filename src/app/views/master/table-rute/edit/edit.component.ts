import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_RUTE } from 'src/constants';

@Component({
  selector: 'app-edit-rute',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class TableRuteEditComponent  implements OnInit {
  myForm: FormGroup;
  adding: boolean = false;
  kodeGudang: any;
  selectedKodeOutlet: any[] = [];
  listKodeOutlet: any[] = [];
  allKodeOutlet: any[] = [];
  draggedIndex: number | null = null;
  sequence:any;
  editData:any;
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
    this.editData = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_RUTE));
    this.loadBranchList();
    this.getKodeOutletByNomorRute();
    
  }

  ngOnInit(): void {

    this.configSelectKodeOutlet = {
      ...this.baseConfig,
      placeholder: 'Pilih Kode Outlet',
      searchPlaceholder: 'Cari Kode Outlet',
      limitTo: this.listKodeOutlet.length,
    };

    console.log(this.editData, "Edit");
    this.myForm = this.form.group({
    noRute: [{ value: this.editData.nomorRute, disabled: true }, [Validators.required, Validators.maxLength(10),  Validators.pattern('^[0-9]+$')]],  // **only digits**]],
    namaRute: [this.editData.namaRute, [Validators.required, Validators.maxLength(100),    Validators.pattern('^[a-zA-Z0-9 ]+$')]],  // **letters, numbers, spaces** ]],
    status: [this.editData.status, [Validators.required]], // Default to 'A' (Active) as shown checked in template
    KodeOutlet: [[...this.selectedKodeOutlet], [Validators.required]] // Array for multiple selection
  });
   


  }

  getKodeOutletByNomorRute(){
  
     const param = {
      nomorRute : this.editData.nomorRute
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
  
 // Method to handle selection change
onOutletSelectionChange(event: any[]) {
  console.log('Selected outlets:', event);

  // Assign the actual objects
  this.selectedKodeOutlet = event.map(item => ({
    id: item.id,
    name: item.name,
    value: item.value,
    seq: item.seq ?? 0
  }));

  console.log('Updated selected:', this.selectedKodeOutlet);

  // Refresh dropdown list
  this.updateDropdownList();
}

    onDragStart(index: number) {
    this.draggedIndex = index;
    console.log(this.draggedIndex, "Drag start")
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Needed to allow drop
    console.log(this.draggedIndex, "Drag Over")
  }

  onDrop(dropIndex: number) {
    if (this.draggedIndex === null || this.draggedIndex === dropIndex) return;

    const draggedItem = this.selectedKodeOutlet[this.draggedIndex];
    this.selectedKodeOutlet.splice(this.draggedIndex, 1);
    this.selectedKodeOutlet.splice(dropIndex, 0, draggedItem);

    this.updateSequence();
    this.draggedIndex = null;
  }

  updateSequence() {
    this.selectedKodeOutlet.forEach((item: { seq: any; }, index: number) => {
      item.seq = index + 1;
      // this.sequence = item.seq;
      // console.log(this.sequence);
    });
    // console.log(this.selectedKodeOutlet["seq"], "Selected")
  }

  onSubmit(): void {
    this.submitted = true;
    const { controls, invalid } = this.myForm;
    if (invalid) {
      this.showErrorToast = true;
      this.g.markAllAsTouched(this.myForm);
      if (invalid) {
        if (
          Object.values(controls).some((control) =>
            control.hasError('required')
          )
        ) {
          this.toastr.error('Beberapa kolom wajib diisi.');
        }
         // Check for invalid pattern or maxLength errors on specific fields
    else if (controls['noRute'].invalid || controls['namaRute'].invalid) {
      // Check number-only violation
      if (controls['noRute'].hasError('pattern')) {
        this.toastr.error('Nomor Rute hanya boleh berisi angka (maks 10 karakter).');
      }
      // Check alphanumeric/name violation
      else if (controls['namaRute'].hasError('pattern')) {
        this.toastr.error('Nama Rute hanya boleh mengandung huruf, angka, dan spasi.');
      }
      // Generic invalid message
      else {
        this.toastr.error('Terdapat kesalahan pada input.');
      }

    }
    return;
  }
}  
      
     else {
      this.adding = true;
      this.updateSequence();
      const param = {
        // originalNomorRute: this.editData.nomorRute, // Store original route number
        nomorRute: this.editData.nomorRute,
        namaRute: controls?.['namaRute']?.value,
        kodeGudang: this.kodeGudang,
        status: controls?.['status']?.value,
        kodeOutlet: this.selectedKodeOutlet,
        userCreate: this.userData.kodeUser,
       
      };
      this.service.insert('/api/rute/update', param).subscribe({
        next: (res) => {
          console.log(JSON.stringify(res), 'JSON Response');
          if (!res.success) {
            this.service.handleErrorResponse(res);
          } else {
            this.toastr.success('Berhasil!');
            setTimeout(() => {
              this.onPreviousPressed();
            }, DEFAULT_DELAY_TIME);
          }
          this.adding = false;
        },
      });
    }
  }

  // updated by Raymond 2 Juli 2025
 conditionInput(event: any, type: string): boolean {
  const inp = String.fromCharCode(event.keyCode);

  // Define regex based on input type
  const temp_regex =
    type === 'noRute'        // only digits
      ? /^[0-9]$/
      : type === 'namaRute'  // letters and digits and spacing
      ? /^[a-zA-Z0-9 ]$/
      : /^[a-zA-Z.() ,\-]*$/; // fallback

  if (temp_regex.test(inp)) return true;
  else {
    event.preventDefault();
    return false;
  }
}
  convertToUppercase(id: any) {
    const control = this.myForm.get(id);
    if (control) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_RUTE);
    this.router.navigate(['/master/master-rute']);
  }

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }

    onChangeSelect(data: any, field: string) {
    const dataStatus = data?.target?.value;
    this.myForm.get('status')?.setValue(dataStatus);
  }

  // Raymond 2 Juli 2025
  loadBranchList() {
  this.service.getAllBranchCode({}).subscribe({
    next: (response) => {
      if (Array.isArray(response.data)) {
        this.allKodeOutlet = response.data.map((item: any) => ({
          code: item.kodeCabang,
          name: `${item.kodeCabang} - ${item.namaCabang}`,
          value: item.kodeCabang
        }));
     this.updateDropdownList();
      }
    },
    error: (err) => console.error(err)
  });
}
updateDropdownList() {
  this.listKodeOutlet = this.allKodeOutlet.filter(opt =>
    !this.selectedKodeOutlet.some(sel => sel.value === opt.value)
  );
  console.log(this.allKodeOutlet, "List ALL kode Outlet");
  console.log(this.listKodeOutlet, "List kode Outlet");
}
}



