import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
// import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SucursalesSocketService {
  private socketSucursal: Socket;
  public socketStatus = false;

  constructor() {
    this.socketSucursal = io(environment.urlSucursal);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketSucursal.on('connect', () => {
      console.log('Conectado al servidor de sucursales');
      this.socketStatus = true;
    });

    this.socketSucursal.on('disconnect', () => {
      console.log('Desconectado del servidor de sucursales');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.socketSucursal.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketSucursal.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }

  destruirSocket(evento: string): any {
    this.socketSucursal.off(evento);
  }
}
