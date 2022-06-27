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

  obtenerProductos(token: string): Observable<any> {
    const url = `${environment.urlProducto}/product/obtenerProductos`;
    const header = new HttpHeaders({ token });

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

  obtenerProductoCriterioNombre(data: any): Observable<any> {
    const url = `${environment.urlProducto}/product/obtenerProductoCriterioNombre`;

    const header = new HttpHeaders({
      token: data.token,
      criterio: data.criterio,
    });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  obtenerProductoCriterioNombrePedido(data: any): Observable<any> {
    const url = `${environment.urlProducto}/product/obtenerProductoCriterioNombrePedido`;

    const header = new HttpHeaders({
      token: data.token,
      criterio: data.criterio,
    });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  eliminarProductoID(id: string, token: string): Observable<any> {
    const url = `${environment.urlProducto}/product/eliminarProducto`;
    const header = new HttpHeaders({ id, token });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarProductoID(id: string, token: string, data: any): Observable<any> {
    const url = `${environment.urlProducto}/product/editarProducto`;
    const header = new HttpHeaders({ id, token });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }
}
