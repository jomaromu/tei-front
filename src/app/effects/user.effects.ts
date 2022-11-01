import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserService } from '../services/user.service';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Usuario } from '../interfaces/resp-worker';
import * as loginActions from '../reducers/login/login.actions';

@Injectable()
export class UserEffects {
  constructor(private actions$: Actions, private userService: UserService) {}

  decodificarToken$ = createEffect((): Observable<any> => {
    return this.actions$.pipe(
      ofType(loginActions.obtenerToken),
      mergeMap((action) =>
        this.userService.decodificarToken(action.token).pipe(
          map((tokenDecoded: Usuario) =>
            loginActions.cargarWorker({ worker: tokenDecoded })
          )
          // tap(data => console.log(data))
          // catchError(err => of(workerActions.cargarErrorWorker({ payload: err }))),
        )
      )
    );
  });

  refrescarToken$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loginActions.obtenerIdUsuario),
      // tap((datos) => console.log(datos)),
      mergeMap((respToken) =>
        this.userService.refrescarToken(respToken.usuario.usuarioDB._id).pipe(
          map((usuario: Usuario) => loginActions.refrescarToken({ usuario })),
          // tap(data => console.log(data)),
          catchError((err) => of(loginActions.lognError()))
        )
      )
    );
  });
}
