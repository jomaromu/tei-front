import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  constructor(private http: HttpClient) {}

  obtenerClientes(token: string): Observable<any> {
    const url = `${environment.urlClient}/client/obtenerTodosUsuarios`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerCliente(data: any): Observable<any> {
    const url = `${environment.urlClient}/client/obtenerCliente`;
    const header = new HttpHeaders({ token: data.token, id: data.id });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerPorBusqueda(data: any): Observable<any> {
    const url = `${environment.urlClient}/client/obtenerPorBusqueda`;
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

  crearCliente(data: any): Observable<any> {
    const url = `${environment.urlClient}/client/nuevoUsuario`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  editarCliente(data: any): Observable<any> {
    const url = `${environment.urlClient}/client/editarUsuario`;
    const header = new HttpHeaders({ token: data.token, id: data.id });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarCliente(data: any): Observable<any> {
    const url = `${environment.urlClient}/client/eliminarUsuario`;
    const header = new HttpHeaders({ token: data.token, id: data.id });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }
}
