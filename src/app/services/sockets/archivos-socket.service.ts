import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
// import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArchivosSocketService {
  private socketArchivo: Socket;
  public socketStatus = false;

  constructor() {
    this.socketArchivo = io(environment.urlArchivos);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketArchivo.on('connect', () => {
      console.log('Conectado al socket de archivos');
      this.socketStatus = true;
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
