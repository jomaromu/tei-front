import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/globarReducers';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  private auth: boolean = false;

  constructor(private router: Router, private store: Store<AppState>) {}

  canActivate(): boolean {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        // console.log(usuario.token);

        if (!usuario.token) {
          this.auth = true;
          // console.log(usuario);
        } else {
          const estado = usuario?.usuarioDB?.estado;

          if (estado !== undefined && estado !== null) {
            if (estado) {
              this.router.navigateByUrl('/dashboard');
              this.auth = false;
            } else {
              this.router.navigateByUrl('/no-permitido');
              this.auth = false;
            }
          }
        }
      });

    return this.auth;
  }
}
