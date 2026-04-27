import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  private decimalPipe = new DecimalPipe('en-US');

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '$ 0.00';
    }
    
    // Parse to number if it's a string
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return '$ 0.00';
    }

    // Format with 1 integer digit minimum, 2 minimum fraction digits, and 2 maximum fraction digits
    const formattedNum = this.decimalPipe.transform(num, '1.2-2');
    
    return formattedNum ? `$ ${formattedNum}` : '$ 0.00';
  }
}
