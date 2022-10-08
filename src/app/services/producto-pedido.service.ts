import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductoPedidoService {
  constructor(private http: HttpClient) {}

  crearProductoPedido(data: any): Observable<any> {
    const url = `${environment.urlProductosPedido}/productoPedido/crearProductoPedido`;

    const header = new HttpHeaders({ token: data.token });
    return this.http
      .post(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  obtenerProductosPedidos(data: any): Observable<any> {
    const url = `${environment.urlProductosPedido}/productoPedido/obtenerProductosPedidos`;
    const header = new HttpHeaders({ token: data.token, pedido: data.pedido });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  eliminarProductoPedido(data: any): Observable<any> {
    const url = `${environment.urlProductosPedido}/productoPedido/eliminarProductoPedido`;

    const header = new HttpHeaders({
      token: data.token,
      id: data.id,
    });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarSeguimientos(data: any): Observable<any> {
    const url = `${environment.urlProductosPedido}/productoPedido/editarSeguimientos`;

    const header = new HttpHeaders({
      idProdPed: data.idProdPed,
      token: data.token,
    });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }
}
