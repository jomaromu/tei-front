import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductoSocketService {
  private socketProducto: Socket;
  public socketStatus = false;

  constructor() {
    this.socketProducto = io(environment.urlProducto);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketProducto.on('connect', () => {
      console.log('Conectado al servidor de producto');
      this.socketStatus = true;
    });

    this.socketProducto.on('disconnect', () => {
      console.log('Desconectado del servidor de producto');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.socketProducto.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketProducto.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }

  destruirSocket(evento: string): any {
    this.socketProducto.off(evento);
  }
}
