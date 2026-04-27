import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: string = 'dd/MM/yyyy HH:mm'): string {
    if (!value) {
      return '-';
    }
    
    try {
      // Using en-US or es-ES depending on the app's default locale
      return formatDate(value, format, 'en-US');
    } catch (e) {
      return String(value);
    }
  }
}
