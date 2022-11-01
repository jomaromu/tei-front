import { Injectable } from '@angular/core';
import { ActivatedRoute, CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class NotfoundGuard implements CanActivate {
  auth = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UserService
  ) {}
  canActivate(): boolean {
    this.route.queryParamMap.subscribe((params) => {
      const hastToken = params.has('token');

      if (hastToken) {
        const token = params.get('token');
        this.auth = true;

        this.usuarioService.decodificarToken(token).subscribe((resp) => {
          if (!resp.ok) {
            this.router.navigateByUrl('/not-found');
            this.auth = false;
          } else {
            this.auth = true;
          }
        });
      } else {
        this.auth = true;
      }
    });
    return this.auth;
  }
}
