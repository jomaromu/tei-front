import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AppState } from '../../reducers/globarReducers';
// import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArchivosSocketService {
  private socketArchivo: Socket;
  public socketStatus = false;

  constructor(private store: Store<AppState>) {
    this.socketArchivo = io(environment.urlArchivos);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketArchivo.on('connect', () => {
      this.store.select('login').subscribe((usuario) => {
        if (usuario.usuarioDB) {
          let foranea = '';

          if (usuario.usuarioDB.empresa) {
            foranea = usuario.usuarioDB._id;
          } else {
            foranea = usuario.usuarioDB.foranea;
          }
          console.log('Conectado al socket de archivos');
          this.socketArchivo.emit('room', foranea);
          this.socketStatus = true;
        }
      });
    });

    this.socketArchivo.on('disconnect', () => {
      console.log('Desconectado del socket de archivos');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.socketArchivo.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketArchivo.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }
}
