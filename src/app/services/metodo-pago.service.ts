import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MetodoPagoService {
  constructor(private http: HttpClient) {}

  obtenerMetodos(token: string): Observable<any> {
    const url = `${environment.urlMetodoPago}/metodoPago/obtenerTododsMetodos`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  crearMetodo(data: any): Observable<any> {
    const url = `${environment.urlMetodoPago}/metodoPago/crearMetodo`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerTododsMetodosCriterio(data: any): Observable<any> {
    const url = `${environment.urlMetodoPago}/metodoPago/obtenerTododsMetodosCriterio`;
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

  obtenerMetodoID(id: string, token: string): Observable<any> {
    const url = `${environment.urlMetodoPago}/metodoPago/obtenerMetodoID`;
    const header = new HttpHeaders({ id, token });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarMetodoID(id: string, data: any): Observable<any> {
    const url = `${environment.urlMetodoPago}/metodoPago/editarMetodo`;
    const header = new HttpHeaders({ id, token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarMetodoID(id: string, token: string): Observable<any> {
    const url = `${environment.urlMetodoPago}/metodoPago/eliminarMetodoID`;
    const header = new HttpHeaders({ id, token });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }
}
