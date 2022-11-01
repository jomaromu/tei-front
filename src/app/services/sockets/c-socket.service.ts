import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AppState } from '../../reducers/globarReducers';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CSocketService {
  private socketCliente: Socket;
  public socketStatus = false;

  constructor(private store: Store<AppState>) {
    this.socketCliente = io(environment.urlClient);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketCliente.on('connect', () => {
      this.store.select('login').subscribe((usuario) => {
        if (usuario.usuarioDB) {
          let foranea = '';

          if (usuario.usuarioDB.empresa) {
            foranea = usuario.usuarioDB._id;
          } else {
            foranea = usuario.usuarioDB.foranea;
          }

          console.log('Conectado al servidor de clientes');
          this.socketCliente.emit('room', foranea);
          this.socketStatus = true;
        }
      });
    });

    this.socketCliente.on('disconnect', () => {
      console.log('Desconectado del servidor de clientes');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.socketCliente.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketCliente.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }

  destruirSocket(evento: string): any {
    this.socketCliente.off(evento);
  }
}
