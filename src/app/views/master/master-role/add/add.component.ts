import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_RSC } from 'src/constants';
import { hakAksesList } from '../menu-list-sidebar';
import { hakAksesListModule } from '../menu-list-module';

function code(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^A-Z0-9\-_ _]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { code: true };
  }
  return null;
}

function desc(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9\- _]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { desc: true };
  }
  return null;
}

@Component({
  selector: 'app-add-role',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class MasterRoleAddComponent implements OnInit {
  myForm: FormGroup;
  adding: boolean = false;
  hakAksesList: any[] = hakAksesList;
  hakAksesListModule: any[] = hakAksesListModule;

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService,
    private cd: ChangeDetectorRef
  ) {}

  atLeastOneCheckboxCheckedValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const controls = (formGroup as FormGroup).controls;

      const atLeastOneChecked = Object.keys(controls)
        .filter((key) => typeof controls[key].value === 'boolean') // hanya cek checkbox
        .some((key) => controls[key].value === true);

      return atLeastOneChecked ? null : { noPermissionSelected: true };
    };
  }

  ngOnInit(): void {
    this.myForm = this.form.group(
      {
        code: ['', [Validators.required, code]],
        desc: ['', [Validators.required, desc]],
      },
      {
        validators: [this.atLeastOneCheckboxCheckedValidator()],
      }
    );

    this.hakAksesList.forEach((group: any) => {
      group.items.forEach((item: any) => {
        this.myForm.addControl(item.id, new FormControl(false));

        this.myForm.get(item.id)?.valueChanges.subscribe((checked) => {
          this.toggleModuleGroupEnable(item.id, checked);
        });

        if (item.children) {
          item.children.forEach((child: any) => {
            this.myForm.addControl(child.id, new FormControl(false));
          });
        }
      });
    });

    this.hakAksesListModule.forEach((group) => {
      group.items.forEach((item: any) => {
        this.myForm.addControl(
          item.id,
          new FormControl({ value: false, disabled: true })
        );

        if (item.children) {
          item.children.forEach((child: any) => {
            this.myForm.addControl(
              child.id,
              new FormControl({ value: false, disabled: true })
            );
          });

          const viewChild = item.children.find(
            (c: any) => c.label.toLowerCase() === 'view'
          );
          const otherChildren = item.children.filter(
            (c: any) => c.label.toLowerCase() !== 'view'
          );

          if (viewChild) {
            otherChildren.forEach((child: any) => {
              this.myForm.get(child.id)?.valueChanges.subscribe((checked) => {
                if (checked) {
                  this.myForm
                    .get(viewChild.id)
                    ?.setValue(true, { emitEvent: false });
                }
              });
            });

            this.myForm.get(viewChild.id)?.valueChanges.subscribe((checked) => {
              if (!checked) {
                otherChildren.forEach((child: any) => {
                  this.myForm
                    .get(child.id)
                    ?.setValue(false, { emitEvent: false });
                });
              }
            });
          }
        }
      });
    });
  }

  toggleModuleGroupEnable(itemId: string, enable: boolean): void {
    const moduleGroup = this.hakAksesListModule.find(
      (group) => group.id.toLowerCase() === itemId.toLowerCase()
    );
    if (!moduleGroup) return;

    moduleGroup.items.forEach((item: any) => {
      const ctrl = this.myForm.get(item.id);
      if (ctrl) {
        if (enable) ctrl.enable();
        else {
          ctrl.disable();
          ctrl.setValue(false);
        }
      }

      if (item.children) {
        item.children.forEach((child: any) => {
          const childCtrl = this.myForm.get(child.id);
          if (childCtrl) {
            if (enable) childCtrl.enable();
            else {
              childCtrl.disable();
              childCtrl.setValue(false);
            }
          }
        });
      }
    });
    this.cd.detectChanges();
  }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    if (invalid) {
      this.g.markAllAsTouched(this.myForm);
      if (invalid) {
        if (
          Object.values(controls).some((control) =>
            control.hasError('required')
          )
        ) {
          this.toastr.error('Beberapa kolom wajib diisi.');
        } else if (
          Object.values(controls).some((control) => control.hasError('code')) ||
          Object.values(controls).some((control) => control.hasError('area'))
        ) {
          this.toastr.error(
            'Beberapa kolom mengandung karakter khusus yang tidak diperbolehkan.'
          );
        } else if (this.myForm.hasError('noPermissionSelected')) {
          this.toastr.error('Minimal satu hak akses harus dipilih.');
        }
      }
    } else {
      const formValues = this.myForm.value;

      const selectedKeys = Object.entries(formValues)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);

      const selectedSet = new Set<string>(selectedKeys);

      // ---------- Sidebar Permissions ----------
      const hakAksesSidebarSet = new Set<string>();

      this.hakAksesList.forEach((group: any) => {
        let groupHasSelectedItem = false;

        group.items.forEach((item: any) => {
          if (item.children?.length) {
            const childChecked = item.children.some((child: any) =>
              selectedSet.has(child.id)
            );
            if (childChecked) {
              hakAksesSidebarSet.add(item.id);
              item.children.forEach((child: any) => {
                if (selectedSet.has(child.id)) {
                  hakAksesSidebarSet.add(child.id);
                }
              });
              groupHasSelectedItem = true;
            }
          } else {
            if (selectedSet.has(item.id)) {
              hakAksesSidebarSet.add(item.id);
              groupHasSelectedItem = true;
            }
          }
        });
      });

      // ---------- Module Permissions ----------
      const hakAksesModuleSet = new Set<string>();

      this.hakAksesListModule.forEach((group) => {
        group.items.forEach((item: any) => {
          if (item.children?.length) {
            const childChecked = item.children.some((child: any) =>
              selectedSet.has(child.id)
            );
            if (childChecked) {
              item.children.forEach((child: any) => {
                if (selectedSet.has(child.id)) {
                  hakAksesModuleSet.add(child.id);
                }
              });
            }
          } else {
            if (selectedSet.has(item.id)) {
              hakAksesModuleSet.add(item.id);
            }
          }
        });
      });

      // const prefixes = new Set<string>();

      // Array.from(hakAksesModuleSet).forEach((item) => {
      //   if (item.includes('.')) {
      //     const prefix = item.split('.')[0];
      //     prefixes.add(prefix);
      //   }
      // });

      // prefixes.forEach((prefix) => hakAksesModuleSet.add(prefix));

      this.adding = true;
      const param = {
        code: controls?.['code']?.value,
        desc: controls?.['desc']?.value,
        user: this.g.getLocalstorage('inv_currentUser')?.kodeUser,
        statusSync: 'T',
        hakAksesSidebar: Array.from(hakAksesSidebarSet),
        hakAksesModule: Array.from(hakAksesModuleSet),
      };
      this.service.insert('/api/role/insert', param).subscribe({
        next: (res) => {
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

  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'code'
        ? /^[a-zA-Z0-9\-_ ]+$/
        : type == 'desc'
        ? /^[a-zA-Z0-9\- ]+$/
        : /^[a-zA-Z.() ,\-]*$/;
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
    localStorage.removeItem(LS_INV_SELECTED_RSC);
    this.router.navigate(['/master/master-role']);
  }

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }
}
