import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/globarReducers';
import { first, map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

@Pipe({
  name: 'enlaces'
})
export class EnlacesPipe implements PipeTransform {

  subArchivo: Observable<any>;

  constructor(
  ) { }

  transform(nombreArhivo: string): any {

    if (!nombreArhivo) {
      return;
    }

    const url = `${environment.urlArchivos}/archivo/enviarArchivo?nombreArchivo=${nombreArhivo}`;
    return url;
  }

}
