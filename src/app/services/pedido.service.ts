import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/globarReducers';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  constructor(private http: HttpClient, private store: Store<AppState>) {}

  crearPedido(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/crearPedido`;

    const header = new HttpHeaders({
      token: data.token,
    });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerPedidos(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/obtenerPedidos`;
    const header = new HttpHeaders({
      token: data.token,
      sucursales: data.sucursales || '',
      etapas: data.etapas || '',
      verPropias: data.verPropias || '',
      criterio: data.criterio || '',
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  buscarPedidos(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/buscarPedidos`;
    const header = new HttpHeaders({
      token: data.token,
      criterio: data.criterio,
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  buscarArchivados(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/buscarArchivados`;
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

  obtenerPedido(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/obtenerPedido`;
    const header = new HttpHeaders({
      token: data.token,
      id: data.id,
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  editarInfo(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/editarInfo`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  eliminarPedido(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/eliminarPedido`;
    const header = new HttpHeaders({
      token: data.token,
      idPedido: data.idPedido,
      foranea: data.foranea,
    });

    return this.http.delete(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  guardarHistorial(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/guardarHistorial`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerHistorial(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/obtenerHistorial`;
    const header = new HttpHeaders({
      token: data.token,
      idPedido: data.idPedido,
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
}
