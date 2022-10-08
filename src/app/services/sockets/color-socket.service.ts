import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ColorSocketService {
  private socketColor: Socket;
  public socketStatus = false;

  constructor() {
    this.socketColor = io(environment.urlColor);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketColor.on('connect', () => {
      console.log('Conectado al servidor de colores');
      this.socketStatus = true;
    });

    this.socketColor.on('disconnect', () => {
      console.log('Desconectado del servidor de colores');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.socketColor.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketColor.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }

  destruirSocket(evento: string): any {
    this.socketColor.off(evento);
  }
}
