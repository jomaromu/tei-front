import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PrioridadService {
  constructor(private http: HttpClient) {}

  crearPrioridad(data: any): Observable<any> {
    const url = `${environment.urlPrioridad}/prioridad/crearPrioridad`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerPrioridades(data: any): Observable<any> {
    const url = `${environment.urlPrioridad}/prioridad/obtenerPrioridades`;
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

  editarPrioridad(data: any): Observable<any> {
    const url = `${environment.urlPrioridad}/prioridad/editarPrioridad`;
    const header = new HttpHeaders({ token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarPrioridad(data: any): Observable<any> {
    const url = `${environment.urlPrioridad}/prioridad/eliminarPrioridad`;
    const header = new HttpHeaders({
      token: data.token,
      id: data.id,
      foranea: data.foranea,
    });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }

  actualizarPrioriadesOrdenadas(data: any): Observable<any> {
    const url = `${environment.urlPrioridad}/prioridad/actualizarPrioriadesOrdenadas`;
    const header = new HttpHeaders({ token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  obtenerPrioridadesOrdenadas(data: any): Observable<any> {
    const url = `${environment.urlPrioridad}/prioridad/obtenerPrioridadesOrdenadas`;
    const header = new HttpHeaders({
      token: data.token,
      colPrioridad: data.colPrioridad,
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
}
