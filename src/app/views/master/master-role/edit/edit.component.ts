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
import {
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_ROLE,
  LS_INV_SELECTED_RSC,
} from 'src/constants';
import { hakAksesList } from '../menu-list-sidebar';
import { hakAksesListModule } from '../menu-list-module';
import { forkJoin } from 'rxjs';

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
  selector: 'app-edit-role',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class MasterRoleEditComponent implements OnInit {
  myForm: FormGroup;
  updating: boolean = false;
  hakAksesList: any[] = hakAksesList;
  hakAksesListModule: any[] = hakAksesListModule;
  dataEdit: any;

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataEdit = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_ROLE));

    const params = {
      roleId: this.dataEdit.id,
    };

    forkJoin({
      sidebar: this.service.hakAksesSidebar(params),
      module: this.service.hakAksesModule(params),
    }).subscribe(({ sidebar, module }) => {
      this.dataEdit.hakAksesSidebar = sidebar.item.map(
        (obj: any) => obj.permission
      );
      this.dataEdit.hakAksesModule = module.item.map(
        (obj: any) => obj.permission
      );

      this.myForm = this.form.group(
        {
          id: [this.dataEdit?.id || ''],
          code: [this.dataEdit?.name || '', [Validators.required, code]],
          desc: [this.dataEdit?.description || '', [Validators.required, desc]],
        },
        {
          validators: [this.atLeastOneCheckboxCheckedValidator()],
        }
      );

      this.hakAksesList.forEach((group: any) => {
        group.items.forEach((item: any) => {
          this.myForm.addControl(item.id, new FormControl(false));
          if (this.dataEdit?.hakAksesSidebar?.includes(item.id)) {
            this.myForm.get(item.id)?.setValue(true);
          }

          if (item.children) {
            item.children.forEach((child: any) => {
              this.myForm.addControl(child.id, new FormControl(false));
              if (this.dataEdit?.hakAksesSidebar?.includes(child.id)) {
                this.myForm.get(child.id)?.setValue(true);
              }
            });
          }

          this.myForm.get(item.id)?.valueChanges.subscribe((checked) => {
            this.toggleModuleGroupEnable(item.id, checked);

            this.hakAksesListModule.forEach((modGroup) => {
              if (modGroup.id === item.id) {
                modGroup.items.forEach((modItem: any) => {
                  if (modItem.children) {
                    modItem.children.forEach((modChild: any) => {
                      const ctrl = this.myForm.get(modChild.id);
                      if (ctrl) {
                        if (checked) {
                          ctrl.enable({ emitEvent: false });
                        } else {
                          ctrl.setValue(false, { emitEvent: false });
                          ctrl.disable({ emitEvent: false });
                        }
                      }
                    });
                  } else {
                    const ctrl = this.myForm.get(modItem.id);
                    if (ctrl) {
                      if (checked) {
                        ctrl.enable({ emitEvent: false });
                      } else {
                        ctrl.setValue(false, { emitEvent: false });
                        ctrl.disable({ emitEvent: false });
                      }
                    }
                  }
                });
              }
            });
          });
        });
      });

      this.hakAksesListModule.forEach((group) => {
        group.items.forEach((item: any) => {
          const itemEnabled = this.dataEdit?.hakAksesModule?.includes(item.id);
          this.myForm.addControl(
            item.id,
            new FormControl({
              value: itemEnabled,
              disabled: false,
            })
          );

          if (item.children) {
            item.children.forEach((child: any) => {
              const childEnabled = this.dataEdit?.hakAksesModule?.includes(
                child.id
              );
              const sidebarId = group.id;
              this.myForm.addControl(
                child.id,
                new FormControl({
                  value: childEnabled,
                  disabled:
                    !this.dataEdit?.hakAksesSidebar?.includes(sidebarId),
                })
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

              this.myForm
                .get(viewChild.id)
                ?.valueChanges.subscribe((checked) => {
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
    });
  }

  toggleModuleGroupEnable(groupId: string, enabled: boolean): void {
    const group = this.hakAksesListModule.find((g) => g.id === groupId);
    if (group) {
      group.items.forEach((item: any) => {
        this.myForm
          .get(item.id)
          ?.[enabled ? 'enable' : 'disable']({ emitEvent: false });

        if (item.children) {
          item.children.forEach((child: any) => {
            this.myForm
              .get(child.id)
              ?.[enabled ? 'enable' : 'disable']({ emitEvent: false });
          });
        }
      });
    }
  }

  // Fungsi tambahan untuk aktifkan/disable checkbox sesuai akses
  enableCheckboxByAccess(hakAksesList: any[], hakAkses: string[]) {
    hakAksesList.forEach((group) => {
      group.items.forEach((item: any) => {
        const targets = item.children ?? [item];
        targets.forEach((control: any) => {
          const ctrl = this.myForm.get(control.id);
          if (!ctrl) return;
          const hasAccess = hakAkses.includes(control.id);
          ctrl.setValue(hasAccess, { emitEvent: false });
          if (hasAccess) ctrl.enable({ emitEvent: false });
          else ctrl.disable({ emitEvent: false });
        });
      });
    });
  }

  atLeastOneCheckboxCheckedValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const controls = (formGroup as FormGroup).controls;
      const atLeastOneChecked = Object.keys(controls)
        .filter((key) => typeof controls[key].value === 'boolean')
        .some((key) => controls[key].value === true);
      return atLeastOneChecked ? null : { noPermissionSelected: true };
    };
  }

  // toggleModuleGroupEnable(itemId: string, enable: boolean): void {
  //   const moduleGroup = this.hakAksesListModule.find(
  //     (group) => group.id.toLowerCase() === itemId.toLowerCase()
  //   );
  //   if (!moduleGroup) return;

  //   moduleGroup.items.forEach((item: any) => {
  //     const ctrl = this.myForm.get(item.id);
  //     if (ctrl) {
  //       if (enable) ctrl.enable();
  //       else {
  //         ctrl.disable();
  //         ctrl.setValue(false);
  //       }
  //     }

  //     if (item.children) {
  //       item.children.forEach((child: any) => {
  //         const childCtrl = this.myForm.get(child.id);
  //         if (childCtrl) {
  //           if (enable) childCtrl.enable();
  //           else {
  //             childCtrl.disable();
  //             childCtrl.setValue(false);
  //           }
  //         }
  //       });
  //     }
  //   });
  //   this.cd.detectChanges();
  // }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    console.log(
      Object.keys(controls).forEach((key) => {
        const controlErrors = controls[key].errors;
        if (controlErrors) {
          console.log('Error pada kontrol', key, ':', controlErrors);
        }
      })
    );
    if (invalid) {
      this.g.markAllAsTouched(this.myForm);
      if (
        Object.values(controls).some((control) => control.hasError('required'))
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
    } else {
      const formValues = this.myForm.value;
      const selectedKeys = Object.entries(formValues)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);
      const selectedSet = new Set<string>(selectedKeys);

      const hakAksesSidebarSet = new Set<string>();
      this.hakAksesList.forEach((group: any) => {
        group.items.forEach((item: any) => {
          if (item.children?.length) {
            const childChecked = item.children.some((child: any) =>
              selectedSet.has(child.id)
            );
            if (childChecked) {
              hakAksesSidebarSet.add(item.id);
              item.children.forEach((child: any) => {
                if (selectedSet.has(child.id)) hakAksesSidebarSet.add(child.id);
              });
            }
          } else if (selectedSet.has(item.id)) {
            hakAksesSidebarSet.add(item.id);
          }
        });
      });

      const hakAksesModuleSet = new Set<string>();
      this.hakAksesListModule.forEach((group) => {
        group.items.forEach((item: any) => {
          if (item.children?.length) {
            item.children.forEach((child: any) => {
              if (selectedSet.has(child.id)) hakAksesModuleSet.add(child.id);
            });
          } else if (selectedSet.has(item.id)) {
            hakAksesModuleSet.add(item.id);
          }
        });
      });

      this.updating = true;
      const param = {
        id: String(this.dataEdit?.id || ''),
        code: controls?.['code']?.value,
        desc: controls?.['desc']?.value,
        user: this.g.getLocalstorage('inv_currentUser')?.kodeUser,
        statusSync: 'T',
        hakAksesSidebar: Array.from(hakAksesSidebarSet),
        hakAksesModule: Array.from(hakAksesModuleSet),
      };

      this.service.insert('/api/role/update', param).subscribe({
        next: (res) => {
          if (!res.success) {
            this.service.handleErrorResponse(res);
          } else {
            this.toastr.success('Berhasil!');
            setTimeout(() => {
              this.onPreviousPressed();
            }, DEFAULT_DELAY_TIME);
          }
          this.updating = false;
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

  isFieldValid(fieldName: string) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }
}
