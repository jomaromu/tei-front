import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take, first } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { AppState } from '../../reducers/globarReducers';
// import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BandejaSocketService {
  private sockeBandeja: Socket;
  public socketStatus = false;

  constructor(private store: Store<AppState>) {
    this.sockeBandeja = io(environment.urlPedido);
    this.checkStatus();
  }

  checkStatus(): void {
    this.sockeBandeja.on('connect', () => {
      this.store.select('login').subscribe((usuario) => {
        if (usuario.usuarioDB) {
          let foranea = '';

          if (usuario.usuarioDB.empresa) {
            foranea = usuario.usuarioDB._id;
          } else {
            foranea = usuario.usuarioDB.foranea;
          }
          console.log('Conectado al socket de pedidos(Bandeja)');
          this.sockeBandeja.emit('room', foranea);
          this.socketStatus = true;
        }
      });
    });

    this.sockeBandeja.on('disconnect', () => {
      console.log('Desconectado del socket de pedidos(Bandeja)');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.sockeBandeja.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.sockeBandeja.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }
}
