import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { AppState } from '../reducers/globarReducers';

@Injectable({
  providedIn: 'root'
})
export class DashboardGuard implements CanActivate {

  private auth: boolean;

  constructor(
    private router: Router,
    private store: Store<AppState>
  ) { }

  canActivate(): boolean {

    const token = localStorage.getItem('token');

    // console.log('ok');
    this.store.select('login').pipe(first())
      .subscribe(usuario => {

        if (!usuario.token) {
          this.router.navigateByUrl('/login');
          this.auth = false;
        } else {
          this.auth = true;
        }
      });

    return this.auth;
  }


}
