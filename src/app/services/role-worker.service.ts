import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RoleWorkerService {
  constructor(private http: HttpClient) {}

  crearRole(data: any): Observable<any> {
    const url = `${environment.urlRoleWorker}/colrole/nuevoRole`;
    const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  editarRole(data: any): Observable<any> {
    const url = `${environment.urlRoleWorker}/colrole/editarRole`;
    const header = new HttpHeaders({
      id: data.id,
      token: data.token,
      foranea: data.foranea,
    });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  editarRestricciones(data: any): Observable<any> {
    const url = `${environment.urlRoleWorker}/colrole/editarRestricciones`;
    const header = new HttpHeaders({
      id: data.id,
      token: data.token,
      foranea: data.foranea,
    });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  obtenerRoles(data: any): Observable<any> {
    const url = `${environment.urlRoleWorker}/colrole/obtenerTodos`;
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

  eliminarRole(data: any): Observable<any> {
    const url = `${environment.urlRoleWorker}/colrole/eliminarRole`;
    const header = new HttpHeaders({
      id: data.id,
      token: data.token,
      foranea: data.foranea,
    });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }
}
