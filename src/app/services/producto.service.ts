import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  constructor(private http: HttpClient) {}

  obtenerProductos(data: any): Observable<any> {
    const url = `${environment.urlProducto}/product/obtenerProductos`;
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

  crearProducto(data: any): Observable<any> {
    const url = `${environment.urlProducto}/product/nuevoProducto`;

    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerProductoID(id: string, token: string): Observable<any> {
    const url = `${environment.urlProducto}/product/obtenerProductoID`;
    const header = new HttpHeaders({ id, token });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  eliminarProductoID(data: any): Observable<any> {
    const url = `${environment.urlProducto}/product/eliminarProducto`;
    const header = new HttpHeaders({
      id: data.id,
      token: data.token,
      foranea: data.foranea,
    });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarProductoID(data: any): Observable<any> {
    const url = `${environment.urlProducto}/product/editarProducto`;
    const header = new HttpHeaders({ id: data.id, token: data.token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  obtenerProductoCriterio(data: any): Observable<any> {
    const url = `${environment.urlProducto}/product/obtenerProductoCriterio`;

    const header = new HttpHeaders({
      token: data.token,
      criterio: data.criterio,
      foranea: data.foranea,
    });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }
}
