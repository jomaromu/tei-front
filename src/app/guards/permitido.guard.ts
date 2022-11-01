import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/globarReducers';

@Injectable({
  providedIn: 'root',
})
export class PermitidoGuard implements CanActivate {
  auth: boolean;
  constructor(private router: Router, private store: Store<AppState>) {}

  canActivate(): boolean {
    this.store.select('login').subscribe((usuario) => {
      const estado: boolean = usuario?.usuarioDB?.estado;



      if (!estado) {
        this.auth = true;
      } else {
        this.router.navigateByUrl('/login');
        this.auth = false;
      }

      if (!usuario?.token) {
        this.router.navigateByUrl('/login');
        this.auth = false;
      }
    });
    return this.auth;
  }
}
