import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FilterDataPipe} from './filter.pipe';

@NgModule({
  declarations: [FilterDataPipe],
  exports: [FilterDataPipe],
  imports: [CommonModule],
})
export class SharedCustomPipeModule {}
