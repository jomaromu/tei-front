import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PagosService {
  constructor(private http: HttpClient) {}

  crearPago(data: any): Observable<any> {
    const url = `${environment.urlPagos}/pago/crearPago`;
    const header = new HttpHeaders({ token: data.token });

    return this.http
      .post(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  obtenerPagosPorPedido(data: any): Observable<any> {
    const url = `${environment.urlPagos}/pago/obtenerPagosPorPedido`;
    const header = new HttpHeaders({
      token: data.token,
      pedido: data.pedido,
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarMotivo(data: any): Observable<any> {
    const url = `${environment.urlPagos}/pago/editarMotivo`;
    const header = new HttpHeaders({ token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }
}
