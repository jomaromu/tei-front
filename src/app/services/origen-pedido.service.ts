import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrigenPedidoService {
  constructor(private http: HttpClient) {}

  obtenerOrigenes(token: string): Observable<any> {
    const url = `${environment.urlOrigen}/origenPedido/obtenerOrigenes`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  crearOrigen(data: any): Observable<any> {
    const url = `${environment.urlOrigen}/origenPedido/crearOrigen`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerOrigenesCriterio(data: any): Observable<any> {
    const url = `${environment.urlOrigen}/origenPedido/obtenerOrigenesCriterio`;
    const header = new HttpHeaders({
      token: data.token,
      criterio: data.criterio,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerOrigenID(id: string, token: string): Observable<any> {
    const url = `${environment.urlOrigen}/origenPedido/obtenerOrigen`;
    const header = new HttpHeaders({ id, token });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarOrigenID(id: string, data: any): Observable<any> {
    const url = `${environment.urlOrigen}/origenPedido/editarOrigen`;
    const header = new HttpHeaders({ id, token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarOrigenID(id: string, token: string): Observable<any> {
    const url = `${environment.urlOrigen}/origenPedido/eliminarOrigen`;
    const header = new HttpHeaders({ id, token });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }
}
