import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/globarReducers';
import * as historialBandejasActions from '../reducers/historial-bandejas/historial-bandejas.actions';
import { MiBandeja } from '../reducers/historial-bandejas/historial-bandejas.reducer';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  bandeja: MiBandeja;

  constructor(private http: HttpClient, private store: Store<AppState>) {}

  crearPedido(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/crearPedido`;

    const header = new HttpHeaders({
      token: data.token,
      cliente: data.cliente,
      sucursal: data.sucursal,
      vendedor: data.vendedor,
    });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  editarPedido(data: any, token: string): Observable<any> {

    const url = `${environment.urlPedido}/pedidos/editarPedido`;
    const header = new HttpHeaders({ token, id: data.id });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((pedido: any) => pedido));
  }

  obtenerPedidos(token: string): Observable<any> {

    const url = `${environment.urlPedido}/pedidos/obtenerTodos`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  obtenerPedido(data: any): Observable<any> {

    // console.log(data);

    const url = `${environment.urlPedido}/pedidos/obtenerPedidoID`;
    const header = new HttpHeaders({ token: data.token, id: data.idPedido });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  busquedaBandejas(data: any): Observable<any> {

    const url = `${environment.urlPedido}/pedidos/busquedaBandeja`;

    // tslint:disable-next-line: max-line-length
    const header = new HttpHeaders({
      token: data.token,
      // colRole: data.colRole,
      sucursal: data.sucursal,
      userID: data.userID,
      bandejas: data.bandejas,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  // obtenerPedidosCriterio(data: any): Observable<any> {
  //   const url = `${environment.urlPedido}/pedidos/obtenerPedidosCriterio`;

  //   const header = new HttpHeaders({
  //     token: data.token,
  //     criterio: data.criterio,
  //   });

  //   return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  // }

  obtenerPedidosPorRole(data: any): Observable<any> {

    const url = `${environment.urlPedido}/pedidos/obtenerPedidosPorRole`;

    // tslint:disable-next-line: max-line-length
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      token: data.token,
      role: data.role,
      idSUcursalWorker: data.idSucursalWorker,
      idUsuario: data.idUsuario,
    });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  obtenerPorBusqueda(data: any): Observable<any> {

    const url = `${environment.urlPedido}/pedidos/obtenerPorBusqueda`;

    // console.log(data)

    // tslint:disable-next-line: max-line-length
    const header = new HttpHeaders({
      token: data.token,
      role: data.role,
      idSUcursalWorker: data.idSucursalWorker,
      idUsuario: data.idUsuario,
      criterio: data.criterio,
    });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  entregadoPorEntregar(data: any): Observable<any> {
    const url = `${environment.urlPedido}/pedidos/entregadoPorEntregar`;

    // tslint:disable-next-line: max-line-length
    const header = new HttpHeaders({
      // 'Content-Type': 'application/json',
      token: data.token,
      role: data.role,
      idSUcursalWorker: data.idSucursalWorker,
      idUsuario: data.idUsuario,
      porEntregar: data.porEntregar,
      entregado: data.entregado,
    });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  porEntregar(token: any): Observable<any> {

    const url = `${environment.urlPedido}/pedidos/porEntregar`;

    // tslint:disable-next-line: max-line-length
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  obtenerBitacoraPorPedido(idPedido: any): Observable<any> {

    const url = `${environment.urlPedido}/pedidos/obtenerBitacoraPorPedido`;
    const header = new HttpHeaders({ idPedido });

    const petBitacora = this.http.get(url, { headers: header });
    const petEtapa = this.http.get(`./assets/etapas.json`);
    const petColores = this.http.get(`./assets/estados.json`);

    return forkJoin([petBitacora, petEtapa, petColores]).pipe(
      map((data: any) => {
        const bitacoraCompleta = {
          bitacora: data[0].bitacoraDB,
          etapas: data[1],
          colores: data[2],
        };

        return bitacoraCompleta;
      })
    );
    // return this.http.get(url, { headers: header }).pipe(map((data) => data));
  }
}

export interface Data {
  token: string;
  role?: string;
  idSucursalWorker?: string;
  idUsuario?: string;
}
