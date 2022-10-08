import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrigenSocketService {

  private socketOrigen: Socket;
  public socketStatus = false;

  constructor() {
    this.socketOrigen = io(environment.urlOrigen);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketOrigen.on('connect', () => {
      console.log('Conectado al servidor de origen');
      this.socketStatus = true;
    });

    this.socketOrigen.on('disconnect', () => {
      console.log('Desconectado del servidor de origen');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.socketOrigen.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketOrigen.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }

  destruirSocket(evento: string): any {
    this.socketOrigen.off(evento);
  }
}
