import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserService } from '../services/user.service';
import { catchError, map, mapTo, mergeMap, tap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { Usuario } from '../interfaces/resp-worker';
import * as loginActions from '../reducers/login/login.actions';
import * as ayudasActions from '../reducers/ayuda/ayuda.actions';
import { AyudaService } from '../services/ayuda.service';
import { Ayuda } from '../interfaces/ayuda';
import { PedidoService } from '../services/pedido.service';
import * as pedidosActions from '../reducers/pedidos/pedido.actions';
import { Pedido } from '../interfaces/pedido';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private ayudaService: AyudaService,
    private pedidoService: PedidoService
  ) {}

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

  cargarAyudas$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loginActions.obtenerToken),
      mergeMap((respToken) =>
        this.ayudaService.obtenerAyudas(respToken.token).pipe(
          // tap(data => console.log(data)),
          map((ayudas: Ayuda) =>
            ayudasActions.cargarAyudas({ ayudas: ayudas.ayudasDB })
          )
        )
      )
    );
  });

  // cargarPedidos$ = createEffect(() => {

  //     return this.actions$.pipe(
  //         ofType(loginActions.obtenerToken),
  //         mergeMap(respToken => this.pedidoService.obtenerPedidos(respToken.token)
  //             .pipe(
  //                 // tap(data => console.log(data)),
  //                 map((pedidos: Pedido) => pedidosActions.obtenerPedidos({pedidos})),
  //             )
  //         )
  //     );
  // });
}
