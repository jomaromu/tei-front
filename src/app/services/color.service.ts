import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  constructor(private http: HttpClient) {}

  crearColor(data: any): Observable<any> {
    const url = `${environment.urlColor}/colores/nuevoColor`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerColores(data: any): Observable<any> {
    const url = `${environment.urlColor}/colores/obtenerColores`;
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

  editarColor(data: any): Observable<any> {
    const url = `${environment.urlColor}/colores/editarColor`;
    const header = new HttpHeaders({ token: data.token, id: data.id });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((pedido: any) => pedido));
  }

  eliminarColor(data: any): Observable<any> {
    const url = `${environment.urlColor}/colores/eliminarColor`;
    const header = new HttpHeaders({
      id: data.id,
      token: data.token,
      foranea: data.foranea,
    });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }
}
