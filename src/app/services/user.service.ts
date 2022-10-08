import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  crearUsuario(data: any): Observable<any> {
    const url = `${environment.urlWorker}/worker/nuevoUsuario`;

    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerUsuarios(token: string): Observable<any> {
    const url = `${environment.urlWorker}/worker/obtenerUsuarios`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  editarUsuario(data: any): Observable<any> {
    const url = `${environment.urlWorker}/worker/editarUsuario`;
    const header = new HttpHeaders({ token: data.token, id: data.id });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarUsuario(data: any): Observable<any> {
    const url = `${environment.urlWorker}/worker/eliminarUsuario`;
    const header = new HttpHeaders({ token: data.token, id: data.id });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }

  login(usuario: any): Observable<any> {
    const url = `${environment.urlWorker}/worker/loguearUsuario`;

    return this.http.post(url, usuario).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  decodificarToken(token: string): Observable<any> {
    const url = `${environment.urlWorker}/worker/decodificarToken`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp) => {
        return resp;
      })
    );
  }

  refrescarToken(idUsuario: any): Observable<any> {
    const url = `${environment.urlWorker}/worker/refrescarToken`;

    return this.http.post(url, { idUsuario }).pipe(
      map((resp) => {
        return resp;
      })
    );
  }
}
