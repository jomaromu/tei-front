import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from './reducers/globarReducers';
import * as loginActions from './reducers/login/login.actions';
import * as moment from 'moment';
import { Subscription, timer } from 'rxjs';
import { UserService } from './services/user.service';
import { Usuario } from './interfaces/resp-worker';
import { first, take } from 'rxjs/operators';
import { Router } from '@angular/router';
moment().locale('es');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  contador = 0;
  once = false;
  idUsuario: string;
  worker: Usuario;
  token: string;

  sub1: Subscription;
  sub2: Subscription;
  public timer: Subscription;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.cargarUsuario();
    this.refrescarToken();
    this.checkToken();
  }

  cargarUsuario(): void {
    this.sub1 = this.store.select('login').subscribe((data) => {
      // console.log(data);
      if (data.ok === null) {
        return;
      } else if (!data.ok) {
        localStorage.clear();
        window.location.reload();
      }
      this.worker = data;
    });
  }

  checkToken(): void {
    // return;
    this.timer = timer(0, 1000).subscribe((time) => {
      if (!this.worker) {
        return;
      }

      const exp = this.worker.exp;

      const isExpired = moment.utc(new Date()).isAfter(new Date(exp * 1000));

      // console.log(isExpired);

      if (isExpired) {
        localStorage.clear();
        window.location.reload();
      }
    });
  }

  refrescarToken(): void {
    // window.addEventListener(
    //   'click',
    //   (e) => {
    //     if (this.contador > 4) {
    window.addEventListener('load', (e) => {
      if (this.worker !== undefined) {
        // console.log(this.worker.usuario.colaborador_role);
        // refrescar token

        this.store.dispatch(
          loginActions.obtenerIdUsuario({ usuario: this.worker })
        );

        setTimeout(() => {
          // decodifico token
          this.store.dispatch(
            loginActions.obtenerToken({
              token: localStorage.getItem('token'),
            })
          );
          // console.log(this.worker);
        }, 300);

        // console.log(this.worker.usuario.colaborador_role);

        // this.contador = 0;
        // this.once = true;
      }
    });

    //  else if (this.contador < 5) {
    //   this.contador++;
    //   this.once = false;
    // }
    //   },
    //   { once: this.once }
    // );
    // }
  }

  ngOnDestroy(): void {
    // this.sub1.unsubscribe();
  }
}
