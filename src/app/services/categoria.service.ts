import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  constructor(private http: HttpClient) {}

  obtenerCategorias(data: any): Observable<any> {
    const url = `${environment.urlCategoria}/categoria/obtenerTodasCategorias`;
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

  obtenerCategoriaCriterio(data: any): Observable<any> {
    const url = `${environment.urlCategoria}/categoria/obtenerCategoriaCriterio`;
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

  crearCategoria(data: any): Observable<any> {
    const url = `${environment.urlCategoria}/categoria/crearCategoria`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerCategoriaID(id: string, token: string): Observable<any> {
    const url = `${environment.urlCategoria}/categoria/obtenerCategoriaID`;
    const header = new HttpHeaders({ id, token });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarCategoriaID(data: any): Observable<any> {
    const url = `${environment.urlCategoria}/categoria/editarCategoriaID`;
    const header = new HttpHeaders({ token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarCategoriaID(data: any): Observable<any> {
    const url = `${environment.urlCategoria}/categoria/eliminarCategoriaID`;
    const header = new HttpHeaders({
      token: data.token,
      id: data.id,
      foranea: data.foranea,
    });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }
}
