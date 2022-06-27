import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(
    private http: HttpClient
  ) { }

  crearPago(data: any): Observable<any> {

    const url = `${environment.urlPagos}/pago/crearPago`;
    const header = new HttpHeaders({ token: data.token, pedido: data.pedido, metodo: data.metodo });

    return this.http.post(url, data, { headers: header })
      .pipe(map(resp => resp));
  }

  obtenerPagosPorPedido(token: string, idPedido: string): Observable<any> {

    const url = `${environment.urlPagos}/pago/obtenerPagosPorPedido`;
    const header = new HttpHeaders({ token, pedido: idPedido });

    return this.http.get(url, { headers: header })
      .pipe(map(resp => resp));
  }

  desactivarPago(data: any): Observable<any> {

    const url = `${environment.urlPagos}/pago/desactivarPago`;
    const header = new HttpHeaders({ token: data.token, pedido: data.idPedido, idPago: data.idPago, motivo: data.motivo });

    return this.http.put(url, data, { headers: header })
      .pipe(map(resp => resp));
  }

}
