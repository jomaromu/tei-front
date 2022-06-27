import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreArchivo'
})
export class NombreArchivoPipe implements PipeTransform {

  transform(nombre: string): string {

    const nombreFinal = nombre.split('-')[0];
    return nombreFinal;
  }

}
