import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

// import { RespUser } from '../../interfaces/resp-worker';
import { AppState } from '../../reducers/globarReducers';
import Swal from 'sweetalert2';
import * as userActions from '../../reducers/login/login.actions';
import { Usuario } from '../../interfaces/resp-worker';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public formulario: FormGroup;

  @ViewChild('alertWarning', { static: true })
  alertWarning: ElementRef<HTMLElement>;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private store: Store<AppState>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
  }

  crearFormulario(): void {
    this.formulario = this.fb.group({
      correo: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
        ],
      ],
      password: ['', [Validators.required]],
    });
  }

  get validarCorreo(): boolean {
    const status = this.formulario.controls.correo.status;

    if (status === 'INVALID') {
      return false;
    } else {
      return true;
    }
  }

  get validarPassword(): boolean {
    const status = this.formulario.controls.password.status;

    if (status === 'INVALID') {
      return false;
    } else {
      return true;
    }
  }

  entrar(): void {
    // console.log(this.formulario.controls.correo);
    const dangerEffectAlert = new Audio(
      '../../../assets/audio/alert-danger.wav'
    );
    const sweetEffectAlert = new Audio('../../../assets/audio/sweet-alert.wav');

    if (!this.validarCorreo || !this.validarPassword) {
      const alertWarning = this.alertWarning.nativeElement;

      alertWarning.style.display = 'none';

      setTimeout(() => {
        alertWarning.style.display = 'flex';
        dangerEffectAlert.play();
      }, 10);

      setTimeout(() => {
        alertWarning.style.display = 'none';
      }, 800);
    } else {
      const correo: string = this.formulario.controls.correo.value;
      const password: string = this.formulario.controls.password.value;

      const usuario = {
        correo: correo.toLowerCase().trim(),
        password: password.toLowerCase().trim(),
      };

      this.userService.login(usuario).subscribe((resp: Usuario) => {
        // console.log(resp);
        if (resp.ok === false) {
          // alert
          sweetEffectAlert.play();
          Swal.fire('Notificación', `${resp.mensaje}`, 'warning');
        } else {
          // console.log(resp);
          this.store.dispatch(userActions.crearToken({ token: resp.token }));
          // this.router.navigateByUrl('/dashboard');
          this.router.navigate(['dashboard/mi-bandeja']);
        }
      });
    }
  }
}
