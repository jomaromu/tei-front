import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
// import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductosPedidoService {
  private socketProductoPedido: Socket;
  public socketStatus = false;

  constructor() {
    this.socketProductoPedido = io(environment.urlProductosPedido);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketProductoPedido.on('connect', () => {
      console.log('Conectado al servidor de productos pedido');
      this.socketStatus = true;
    });

    this.socketProductoPedido.on('disconnect', () => {
      console.log('Desconectado del servidor de productos pedido');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.socketProductoPedido.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketProductoPedido.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }

  quitarSubscripcion(evento: string): any {
    this.socketProductoPedido.off(evento);
  }
}
