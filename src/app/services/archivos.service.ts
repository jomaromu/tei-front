import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ArchivosService {
  constructor(private http: HttpClient) {}

  subirArchivo(data: FormData, token: string): Observable<any> {
    const url = `${environment.urlArchivos}/archivo/nuevoArchivo`;
    const header = new HttpHeaders({ token });

    return this.http
      .post(url, data, { headers: header })
      .pipe(map((resp) => resp));
    return;
    return this.http
      .post(url, data, {
        headers: header,
        reportProgress: true,
        observe: 'events',
      })
      .pipe(map((resp) => resp));
  }

  obtenerArchivos(data: any): Observable<any> {
    const url = `${environment.urlArchivos}/archivo/obtenerArchivos`;
    const header = new HttpHeaders({
      token: data.token,
      pedido: data.pedido,
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  eliminarArchivo(data: any): Observable<any> {
    const url = `${environment.urlArchivos}/archivo/eliminarArchivo`;
    const header = new HttpHeaders({
      token: data.token,
      id: data.id,
      nombreArchivo: data.nombreArchivo,
      foranea: data.foranea,
    });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }

  eliminarArchivos(data: any): Observable<any> {
    const url = `${environment.urlArchivos}/archivo/eliminarArchivos`;
    const header = new HttpHeaders({
      token: data.token,
      idPedido: data.idPedido,
      archivos: data.archivos,
      foranea: data.foranea,
    });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }
}
