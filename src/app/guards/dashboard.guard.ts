import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/globarReducers';

@Injectable({
  providedIn: 'root',
})
export class DashboardGuard implements CanActivate {
  private auth: boolean = false;

  constructor(private router: Router, private store: Store<AppState>) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    // console.log('ok');
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (!usuario.token) {
          this.router.navigateByUrl('/login');
          this.auth = false;
        } else {
          const estado = usuario?.usuarioDB?.estado;

          if (estado !== undefined && estado !== null) {
            if (estado) {
              // this.router.navigateByUrl('/dashboard');
              this.auth = true;
            } else {
              this.router.navigateByUrl('/no-permitido');
              this.auth = false;
            }
          }
          this.auth = true;
        }
      });

    return this.auth;
  }
}
