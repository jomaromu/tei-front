import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  constructor(private http: HttpClient) {}

  obtenerTodos(token: string): Observable<any> {
    const url = `${environment.urlProductosPedido}/productoPedido/getTodos`;

    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  busquedaPorFecha(data: any): Observable<any> {
    const url = `${environment.urlProductosPedido}/productoPedido/busquedaPorFecha`;

    const header = new HttpHeaders({
      fechaInicial: data.fechaInicial,
      fechaFinal: data.fechaFinal,
      token: data.token,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
}
