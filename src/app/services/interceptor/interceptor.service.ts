import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class InterceptorService implements HttpInterceptor {
  constructor() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const reqClone = req.clone();

    return next.handle(reqClone).pipe(catchError(this.manejaError));
  }

  manejaError(error: HttpErrorResponse): Observable<any> {
    const errorEffectPeticion = new Audio(
      '../../../assets/audio/err-peticion.wav'
    );
    errorEffectPeticion.play();

    Swal.fire(
      'Mensaje',
      `Error en uno o varios servicios: ${error.message}`,
      // `${error}`,
      'error'
    );

    return throwError('Error en servicio');
  }
}
