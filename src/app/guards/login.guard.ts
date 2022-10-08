import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { AppState } from '../reducers/globarReducers';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  private auth: boolean;

  constructor(
    private router: Router,
    private store: Store<AppState>
  ) { }

  canActivate(): boolean {

    this.store.select('login').pipe(first())
      .subscribe(usuario => {

        // console.log(usuario.token);

        if (!usuario.token) {
          this.auth = true;
          console.log(usuario);
        } else {
          this.router.navigateByUrl('/dashboard');
          this.auth = false;
        }
      });

    return this.auth;

  }
}
