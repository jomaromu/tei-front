import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ArchivosService {

  constructor(
    private http: HttpClient
  ) { }

  subirArchivo(data: FormData, token: string, pedido: string): Observable<any> {

    const url = `${environment.urlArchivos}/archivo/nuevoArchivo`;
    const header = new HttpHeaders({ token, pedido });

    return this.http.post(url, data, { headers: header, reportProgress: true, observe: 'events' })
      .pipe(map(resp => resp));
  }

  obtenerTodosArchivos(token: string): Observable<any> {

    const url = `${environment.urlArchivos}/archivo/obtenerTodosArchivos`;

    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header })
      .pipe(map(resp => resp));
  }

  obtenerArchivosPorPedido(token: string, idPedido: string): Observable<any> {

    const url = `${environment.urlArchivos}/archivo/obtenerArchivosPorPedido`;

    const header = new HttpHeaders({ token, idPedido });

    return this.http.get(url, { headers: header })
      .pipe(map(resp => resp));
  }

  eliminarArchivos(data: any): Observable<any> {

    const url = `${environment.urlArchivos}/archivo/eliminarArhivoID`;

    const header = new HttpHeaders({ token: data.token, id: data.id, pedido: data.pedido });

    return this.http.delete(url, { headers: header })
      .pipe(map(resp => resp));
  }
}
