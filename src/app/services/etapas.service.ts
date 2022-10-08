import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EtapasService {
  constructor(private http: HttpClient) {}

  crearEtapa(data: any): Observable<any> {
    const url = `${environment.urlEtapa}/etapas/crearEtapa`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerEtapas(token: string): Observable<any> {
    const url = `${environment.urlEtapa}/etapas/obtenerEtapas`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  editarEtapa(data: any): Observable<any> {
    const url = `${environment.urlEtapa}/etapas/editarEtapa`;
    const header = new HttpHeaders({ token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarEtapa(data: any): Observable<any> {
    const url = `${environment.urlEtapa}/etapas/eliminarEtapa`;
    const header = new HttpHeaders({ token: data.token, id: data.id });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }

  obtenerEtapasOrdenadas(data: any): Observable<any> {
    const url = `${environment.urlEtapa}/etapas/obtenerEtapasOrdenadas`;
    const header = new HttpHeaders({
      token: data.token,
      colEtapas: data.colEtapas,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  actualizarEtapasOrdenadas(data: any): Observable<any> {
    const url = `${environment.urlEtapa}/etapas/actualizarEtapasOrdenadas`;
    const header = new HttpHeaders({ token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }
}
