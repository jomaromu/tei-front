import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MetodoSocketService {
  private socketMetodos: Socket;
  public socketStatus = false;

  constructor() {
    this.socketMetodos = io(environment.urlMetodoPago);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketMetodos.on('connect', () => {
      console.log('Conectado al servidor de métodos de pago');
      this.socketStatus = true;
    });

    this.socketMetodos.on('disconnect', () => {
      console.log('Desconectado del servidor de métodos de pago');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.socketMetodos.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketMetodos.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }

  destruirSocket(evento: string): any {
    this.socketMetodos.off(evento);
  }
}
