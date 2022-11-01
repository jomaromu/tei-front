import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TipoArchivoService {
  constructor(private http: HttpClient) {}

  obtenerTiposArchivos(data: any): Observable<any> {
    const url = `${environment.urlTipoArchivo}/tipoArchivo/obtenerTiposArchivos`;
    const header = new HttpHeaders({
      token: data.token,
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  crearTipoArchivo(data: any): Observable<any> {
    const url = `${environment.urlTipoArchivo}/tipoArchivo/crearTipoArchivo`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerTipoArchivo(id: string, token: string): Observable<any> {
    const url = `${environment.urlTipoArchivo}/tipoArchivo/obtenerTipoArchivo`;
    const header = new HttpHeaders({ id, token });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarTipoArchivo(data: any): Observable<any> {
    const url = `${environment.urlTipoArchivo}/tipoArchivo/editarTipoArchivo`;
    const header = new HttpHeaders({ token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarTipoArchivo(data: any): Observable<any> {
    const url = `${environment.urlTipoArchivo}/tipoArchivo/eliminarTipoArchivo`;
    const header = new HttpHeaders({
      id: data.id,
      token: data.token,
      foranea: data.foranea,
    });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }
}
