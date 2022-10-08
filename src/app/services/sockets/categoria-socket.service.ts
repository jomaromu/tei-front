import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaSocketService {


  private socketCategoria: Socket;
  public socketStatus = false;

  constructor() {
    this.socketCategoria = io(environment.urlCategoria);
    this.checkStatus();
  }

  checkStatus(): void {
    // escuchar el servidor
    this.socketCategoria.on('connect', () => {
      console.log('Conectado al servidor de categoría');
      this.socketStatus = true;
    });

    this.socketCategoria.on('disconnect', () => {
      console.log('Desconectado del servidor de categoría');
      this.socketStatus = false;
    });
  }

  // Emitir eventos
  emitir(evento: string, payload?: any, callback?: any): void {
    this.socketCategoria.emit(evento, payload, callback);
  }

  // Escuchar eventos
  escuchar(evento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketCategoria.on(evento, (callback: any) => {
        subscriber.next(callback);
      });
    });
  }

  destruirSocket(evento: string): any {
    this.socketCategoria.off(evento);
  }
}
