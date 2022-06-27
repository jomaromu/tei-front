import { Pipe, PipeTransform } from '@angular/core';
// import * as moment from 'moment';
import * as moment from 'moment-timezone';
moment.locale('es');

@Pipe({
  name: 'totalReportes',
})
export class TotalReportesPipe implements PipeTransform {
  transform(fecha: string): string {
    // console.log( moment(fecha).format('DD-MM-YYYY'));
    return moment.tz(fecha, 'America/Bogota').format('(DD/MM/YYYY)');
  }
}
