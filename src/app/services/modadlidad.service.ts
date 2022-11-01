import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ModadlidadService {
  constructor(private http: HttpClient) {}

  obtenerModalidades(data: any): Observable<any> {
    const url = `${environment.urlModalidad}/modalidadPago/obtenerModalidades`;
    const header = new HttpHeaders({
      token: data.token,
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  crearModalidadPago(data: any): Observable<any> {
    const url = `${environment.urlModalidad}/modalidadPago/crearModalidadPago`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerModalidad(id: string, token: string): Observable<any> {
    const url = `${environment.urlModalidad}/modalidadPago/obtenerModalidad`;
    const header = new HttpHeaders({ id, token });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarModalidad(data: any): Observable<any> {
    const url = `${environment.urlModalidad}/modalidadPago/editarModalidad`;
    const header = new HttpHeaders({ id: data.id, token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarModalidad(data: any): Observable<any> {
    const url = `${environment.urlModalidad}/modalidadPago/eliminarModalidad`;
    const header = new HttpHeaders({
      id: data.id,
      token: data.token,
      foranea: data.foranea,
    });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }
}
