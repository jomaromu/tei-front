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

  obtenerUsuarios(token: string): Observable<any> {
    const url = `${environment.urlWorker}/worker/obtenerTodosUsuarios`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  obtenerUsuarioID(idUsuario: string, token: string): Observable<any> {
    const url = `${environment.urlWorker}/worker/obtenerUsuarioID`;
    const header = new HttpHeaders({ id: idUsuario, token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  // Obtener todos los usuarios
  obtenerRoles(token: string): Observable<any> {
    const url = `${environment.urlWorker}/colrole/obtenerTodos`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  // Obtener usuarios especificos por role
  obtenerUsuariosRole(token: string, role: string): Observable<any> {
    const url = `${environment.urlWorker}/worker/obtenerUsuariosRole`;
    const header = new HttpHeaders({ token, role });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  // Obtener diseñadores con sus pedidos asignados
  obtenerDistribucion(): Observable<any> {
    const url = `${environment.urlWorker}/worker/obtenerDistribucion`;

    return this.http.get(url).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  editarUsuarioID(id: string, token: string, data: any): Observable<any> {
    const url = `${environment.urlWorker}/worker/editarUsuario`;
    const header = new HttpHeaders({
      id,
      estado: data.estado,
      colaborador_role: data.colaborador_role,
      token,
    });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  eliminarUsuarioID(id: string, token: string): Observable<any> {
    const url = `${environment.urlWorker}/worker/eliminarUsuario`;
    const header = new HttpHeaders({ id, token });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }

  cargarUsuariosSucursalRole(data: any): Observable<any> {
    const url = `${environment.urlWorker}/worker/cargarUsuariosSucursalRole`;

    const header = new HttpHeaders({
      role: data.role,
      sucursal: data.sucursal,
      token: data.token,
    });

    return this.http.get(url, { headers: header }).pipe(map((resp) => resp));
  }

  obtenerCriterioNombreWorker(data: any): Observable<any> {
    const url = `${environment.urlWorker}/worker/obtenerUsuarioCriterioNombre`;
    const header = new HttpHeaders({
      token: data.token,
      criterio: data.criterio,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  historialDB(data: any): Observable<any> {
    const url = `${environment.urlWorker}/historial/historialDB`;

    // const header = new HttpHeaders({ token: data.token });

    return this.http.post(url, data).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  obtenerHistorial(idUsuario: any): Observable<any> {
    const url = `${environment.urlWorker}/historial/obtenerHistorial`;
    // console.log(idUsuario);

    const header = new HttpHeaders({ idUsuario });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  // clientes
  obtenerClientes(token: string): Observable<any> {
    const url = `${environment.urlClient}/client/obtenerTodosUsuarios`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  obtenerClienteID(idUsuario: string, token: string): Observable<any> {
    const url = `${environment.urlClient}/client/obtenerUsuarioID`;
    const header = new HttpHeaders({ id: idUsuario, token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  obtenerClienteRoles(token: string): Observable<any> {
    const url = `${environment.urlClient}/clientRole/obtenerTodos`;
    const header = new HttpHeaders({ token });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
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

  eliminarClienteID(id: string, token: string): Observable<any> {
    const url = `${environment.urlClient}/client/eliminarUsuario`;
    const header = new HttpHeaders({ id, token });

    return this.http.delete(url, { headers: header }).pipe(map((resp) => resp));
  }

  editarClienteID(id: string, token: string, data: any): Observable<any> {
    const url = `${environment.urlClient}/client/editarUsuario`;
    const header = new HttpHeaders({
      id,
      estado: data.estado,
      client_role: data.client_role,
      token,
    });

    return this.http
      .put(url, data, { headers: header })
      .pipe(map((resp) => resp));
  }

  obtenerClienteCriterioNombre(data: any): Observable<any> {
    const url = `${environment.urlClient}/client/obtenerUsuarioCriterioNombre`;
    const header = new HttpHeaders({
      token: data.token,
      criterio: data.criterio,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }

  obtenerClienteCriterioTelefono(data: any): Observable<any> {
    const url = `${environment.urlClient}/client/obtenerUsuarioTel`;
    const header = new HttpHeaders({
      token: data.token,
      telefono: data.telefono,
    });

    return this.http.get(url, { headers: header }).pipe(
      map((resp: Array<any>) => {
        return resp;
      })
    );
  }
}
