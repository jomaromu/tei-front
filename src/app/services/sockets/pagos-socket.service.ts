import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
// import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PagosSocketService {
  private socketPago: Socket;
  public socketStatus = false;

  constructor() {
    this.socketPago = io(environment.urlPagos);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketPago.on('connect', () => {
      console.log('Conectado al servidor de pagos');
      this.socketStatus = true;
    });

    this.socketPago.on('disconnect', () => {
      console.log('Desconectado del servidor de pagos');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.socketPago.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketPago.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }

  quitarSubscripcion(evento: string): any {
    this.socketPago.off(evento);
  }
}
