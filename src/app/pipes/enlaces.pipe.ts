import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ArchivoDB } from '../interfaces/archivo';

@Pipe({
  name: 'enlaces',
})
export class EnlacesPipe implements PipeTransform {
  transform(ruta: ArchivoDB): string {
    // console.log(ruta);
    const archivo = `${ruta.foranea}/${ruta.nombre}.${ruta.ext}`;
    const url = `${environment.urlArchivos}/archivo/abrirArchivo?archivo=${archivo}`;
    return url;
  }
}
