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

  obtenerSucursales(token: string): Observable<any> {
    const url = `${environment.urlSucursal}/sucursales/obtenerTodasSucursales`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  obtenerSucursalID(id: string, token: string): Observable<any> {
    const url = `${environment.urlSucursal}/sucursales/obtenerSucursalID`;
    const header = new HttpHeaders({ id, token });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarSucursalID(id: string, token: string, data: any): Observable<any> {
    const url = `${environment.urlSucursal}/sucursales/editarSucursal`;
    const header = new HttpHeaders({ id, estado: data.estado, token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  obtenerSucursalCriterio(data: any): Observable<any> {
    const url = `${environment.urlSucursal}/sucursales/obtenerSucursalCriterio`;
    const header = new HttpHeaders({
      token: data.token,
      criterio: data.criterio,
    });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  eliminarSucursalID(id: string, token: string): Observable<any> {
    const url = `${environment.urlSucursal}/sucursales/eliminarSucursal`;
    const header = new HttpHeaders({ id, token });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }
}
