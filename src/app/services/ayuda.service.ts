import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AyudaService {

  constructor(
    private http: HttpClient
  ) { }

  obtenerAyudas(token: string): Observable<any> {

    const url = `${environment.urlAyuda}/ayuda/obtenerTodas`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header })
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  crearAyuda(data: any): Observable<any> {

    const url = `${environment.urlAyuda}/ayuda/crearAyuda`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header })
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );

  }

  obtenerAyudaID(id: string, token: string): Observable<any> {

    const url = `${environment.urlAyuda}/ayuda/obtenerAyudaID`;
    const header = new HttpHeaders({ id, token });

    return this.http.get(url, { headers: header })
      .pipe(
        map(resp => resp)
      );


  }

  editarAyudaID(id: string, data: any): Observable<any> {

    const url = `${environment.urlAyuda}/ayuda/editarAyuda`;
    const header = new HttpHeaders({ id, token: data.token });

    return this.http.put(url, data, { headers: header })
      .pipe(
        map(resp => resp)
      );

  }

  eliminarAyudaID(id: string, token: string): Observable<any> {

    const url = `${environment.urlAyuda}/ayuda/eliminarAyuda`;
    const header = new HttpHeaders({ id, token });

    return this.http.delete(url, { headers: header })
      .pipe(
        map(resp => resp)
      );

  }
}
