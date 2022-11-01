import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/globarReducers';

@Injectable({
  providedIn: 'root',
})
export class NoPermitidoGuard implements CanActivate {
  auth: boolean;
  constructor(private router: Router, private store: Store<AppState>) {}

  canActivate(): boolean {
    this.store.select('login').subscribe((usuario) => {
      const estado: boolean = usuario?.usuarioDB?.estado;
      if (estado) {
        this.auth = true;
      } else {
        this.router.navigateByUrl('/no-permitido');
        this.auth = false;
      }
    });
    return this.auth;
  }
}
