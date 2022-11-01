import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SucursalService {
  constructor(private http: HttpClient) {}

  crearSucursal(data: any): Observable<any> {
    const url = `${environment.urlSucursal}/sucursales/nuevaSucursal`;

    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerSucs(data: any): Observable<any> {
    const url = `${environment.urlSucursal}/sucursales/obtenerSucs`;
    const header = new HttpHeaders({
      token: data.token,
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  editarSucursalID(data: any): Observable<any> {
    const url = `${environment.urlSucursal}/sucursales/editarSucursal`;
    const header = new HttpHeaders({ token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarSucursalID(data: any): Observable<any> {
    const url = `${environment.urlSucursal}/sucursales/eliminarSucursal`;
    const header = new HttpHeaders({
      token: data.token,
      id: data.id,
      foranea: data.foranea,
    });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }
}
