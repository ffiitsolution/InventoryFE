import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FooterComponent } from '@coreui/angular';
import { cilInfo } from '@coreui/icons';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';

@Component({
  selector: 'app-mpcs-footer',
  templateUrl: './mpcs-footer.component.html',
  styleUrls: ['./mpcs-footer.component.scss'],
})
export class MpcsFooterComponent
  extends FooterComponent
  implements OnInit, OnDestroy
{
  toggleDiffCacheModal() {
    this.diffCacheModalVisible = !this.diffCacheModalVisible;
  }

  diffCacheModalVisibleChange($event: boolean) {
    this.diffCacheModalVisible = $event;
  }

  @ViewChild('inputCmd') inputCmd!: ElementRef;
  // @ViewChild('confirmMpcsModal') confirmMpcsModal:
  //   | ConfirmMpcsComponent
  //   | undefined;
  // @ViewChild('releasenoteModal') releasenoteModal:
  //   | ReleasenoteComponent
  //   | undefined;

  public appInfo: any = {};
  public currentTime: Date = new Date();
  public yearText: string = '';
  public selectedScreen: string = 'MPCS';
  public cmdValue: string = '';

  icons = { cilInfo };

  screenSubscription: Subscription | undefined;
  diffCacheModalVisible: boolean = false;

  constructor(
    private dataService: DataService,
    public g: GlobalService
  ) {
    super();
  }

  ngOnInit(): void {
  
    const year = this.currentTime.getFullYear();
    this.yearText = year === 2025 ? '2025' : '2025 - ' + year;

    // this.screenSubscription = this.g.screenToShow$.subscribe((value) => {
    //   this.selectedScreen = value;
    // });

    // this.g.registerFunction('TOGGLE_RELEASENOTE', () => {
    //   this.releasenoteModal?.toggleVisibility();
    // });
  }

  ngOnDestroy() {
    this.screenSubscription?.unsubscribe();
  }

  // @HostListener('window:focus', ['$event'])
  // onFocus(event: FocusEvent): void {
  //   this.onInputCmdBlur();
  // }

  // onInputCmdBlur() {
  //   // paksa inputCmd tetap focus
  //   setTimeout(() => {
  //     this.inputCmd.nativeElement.focus();
  //   });
  // }

  emptyInputCmd() {
    this.cmdValue = '';
    this.g.commandInput = '';
  }

  cmdReset() {
    this.emptyInputCmd();
    this.g.executeFunction('RESET');
    // this.g.setScreenToShow('MPCS');
    // this.g.closeChangeFryerOil();
    this.inputCmd.nativeElement.focus();
  }

  onInputCmdChange() {
    this.g.commandInput = this.cmdValue;
  }

  // onCmdEnter() {
  //   this.g.playSound('scan');
  //   const step = this.g.stepConfirm;
  //   const cmd = this.cmdValue.trim().toUpperCase();
  //   // paksa ke mode fullscreen setiap kali scan
  //   if (
  //     this.g.forceFullscreen &&
  //     !this.g.isFullscreen &&
  //     !cmd.includes('QUIT')
  //   ) {
  //     this.g.toggleFullScreen();
  //   }
  //   this.releasenoteModal?.setVisibility(false);
  //   // Jalankan Perintah
  //   if (cmd.includes('RESET') || cmd.includes('CANCEL')) {
  //     this.cmdReset();
  //   } else if (Swal.isVisible()) {
  //     this.emptyInputCmd();
  //     Swal.close();
  //     return;
  //   } else if (cmd.includes('ENTRY')) {
  //     this.g.setScreenToShow('MPCS');
  //   } else if (cmd.includes('QUERY')) {
  //     this.g.setScreenToShow('QUERY');
  //   } else if (cmd.includes('NEXT')) {
  //     this.g.executeFunction('NEXT');
  //   } else if (cmd.includes('PREV')) {
  //     this.g.executeFunction('PREV');
  //   } else if (cmd.includes('FULLSCREEN')) {
  //     this.g.toggleFullScreen();
  //   } else if (cmd.includes('QUIT')) {
  //     // hard reset / reload
  //     this.hardResest();
  //   } else if (cmd.includes('RELEASE')) {
  //     this.releasenoteModal?.toggleVisibility();
  //   } else if (this.selectedScreen === 'MPCS') {
  //     if (this.g.isProcessMpcs) {
  //       // do nothing if still loading
  //     } else if (cmd.includes('CONFIRM')) {
  //       if (step < 5) {
  //         this.g.footerAlert = this.g.textErrorAskReset;
  //       } else {
  //         this.g.executeFunction('PROCESSMPCS');
  //       }
  //     } else if (step <= 1) {
  //       this.g.executeFunction('SEARCHMPCS');
  //     } else if (step <= 2) {
  //       if (
  //         this.g.containsOnlyNumbers(cmd) &&
  //         this.g.selectedMpcs.code.length > 0
  //       ) {
  //         this.g.selectQty(this.g.removeLeadingZeros(cmd));
  //       } else {
  //         this.g.executeFunction('SEARCHMPCS');
  //       }
  //     } else if (step === 3) {
  //       this.g.selectFryer(this.g.removeLeadingZeros(cmd));
  //     } else if (step === 5) {
  //       this.g.footerAlert = this.g.textErrorConfirm;
  //     } else {
  //       this.g.footerAlert = this.g.textErrorAskReset;
  //     }
  //   } else if (this.selectedScreen === 'QUERY') {
  //     this.g.executeFunction('SEARCHQUERY');
  //   } else {
  //     console.log('dont know, it seems its not implemented yet');
  //     this.g.playSound('warning');
  //   }
  //   this.emptyInputCmd();
  // }

  hardResest() {
      // this.g.hardReset();
      // this.g.exitFullScreen();
  }
}
