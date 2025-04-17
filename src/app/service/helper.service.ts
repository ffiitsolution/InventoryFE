import { DecimalPipe } from "@angular/common";
import { Injectable } from "@angular/core";


@Injectable({
  providedIn: 'root',
})
export class HelperService {
  private decimalPipe = new DecimalPipe('en-US');

  applyFilterList(
    listData: any[],
    filterText: string,
    startAfter: number = 1
  ): any[] {
    if (filterText.length >= startAfter) {
      return listData.filter((item) => {
        return JSON.stringify(item)
          .toLowerCase()
          .includes(filterText.toLowerCase());
      });
    } else {
      return listData;
    }
  }

  sanitizedNumber(source: string): number {
    source = '' + source;
    const sanitize = source.replace(/[^0-9.]/g, '');
    if (/\d/.test(sanitize)) {
      if(sanitize.length == 0){
        return 0;
      }
      return Number(sanitize);
    } else {
      return 0;
    }
  }

  formatInputNumber(event: any) {
    const input = event.target;
    const inputValue = input.value.trim();
    const maxdecimal = parseInt(input.getAttribute('maxdecimal') ?? 4);
    const maxlength = parseInt(input.getAttribute('maxlength') ?? 10);
    const minValue = parseFloat(input.getAttribute('min')) || 0;
    const maxValue = parseFloat(input.getAttribute('max') ?? 9999999999);
    const decimalFound = inputValue.toString().split('.').length - 1;
    const sanitizedValue = inputValue.replace(/[^0-9.]/g, '');
    const decimalPart = sanitizedValue.split('.')[1];
    if (decimalFound > 1) {
      let split = sanitizedValue.split('.');
      if (split[1].length > maxdecimal) {
        split[1] = split[1].substring(0, maxdecimal);
      }
      input.value = this.decimalPipe.transform(
        Number(split[0] + '.' + split[1]),
        '1.0-4'
      );
      return;
    } else if (decimalPart && decimalPart.length > maxdecimal) {
      let split = sanitizedValue.split('.');
      if (split[1].length > maxdecimal) {
        split[1] = split[1].substring(0, maxdecimal);
      }
      input.value = this.decimalPipe.transform(
        Number(split[0] + '.' + split[1]),
        '1.0-4'
      );
      return;
    } else if (
      sanitizedValue.length > maxlength ||
      (decimalPart && decimalPart.length > maxdecimal)
    ) {
      input.value = inputValue.slice(0, -1);
      return;
    } else if (
      (inputValue.endsWith('.') ||
        inputValue.endsWith('.0') ||
        inputValue.endsWith('.00') ||
        inputValue.endsWith('.000')) &&
      /\d/.test(inputValue)
    ) {
      return;
    } else if (inputValue.includes('.') && inputValue.endsWith('0')) {
      return;
    }
    let numericValue = parseFloat(sanitizedValue);
    if (numericValue > maxValue || numericValue < minValue) {
      let numVal = '' + numericValue;
      const maxVal = '' + maxValue;
      numVal = numVal.substring(0, maxVal.length);
      if (Number(numVal) > maxValue) {
        numVal = maxVal;
      }
      let formattedValue = this.decimalPipe.transform(Number(numVal), '1.0-4');
      input.value = formattedValue;
      return;
    }
    if (isNaN(numericValue)) {
      input.value = '0';
      let formattedValue = this.decimalPipe.transform(0, '1.0-4');
      input.value = formattedValue;
      return;
    }
    let formattedValue = this.decimalPipe.transform(numericValue, '1.0-4');
    input.value = formattedValue;
  }

  formatDate(date: Date): string {
    const day = ("0" + date.getDate()).slice(-2);  // Ensure two digits for day
    const month = ("0" + (date.getMonth() + 1)).slice(-2);  // Ensure two digits for month
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;  // Return in DD/MM/YYYY format
  }

  abs(value: number): number {
    return Math.abs(value);
  }
  
}
