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
import { Validaciones, ValidarTexto } from 'src/app/classes/validaciones';
import * as loadinActions from '../../reducers/loading/loading.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public formulario: FormGroup;
  public formaResetPass: FormGroup;
  displayDialog = false;

  @ViewChild('alertWarning', { static: true })
  alertWarning: ElementRef<HTMLElement>;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private store: Store<AppState>,
    private router: Router,
    private validadores: Validaciones
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.crearFormularioReset();
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

  crearFormularioReset(): void {
    this.formaResetPass = this.fb.group({
      email: [],
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

  get validarRecuperarPass(): ValidarTexto {
    return this.validadores.validarCorreo({
      requerido: true,
      value: this.formaResetPass.controls.email.value,
    });
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
        password: password,
      };

      this.userService.login(usuario).subscribe((usuario: Usuario) => {
        // console.log(usuario);
        if (usuario.ok === false) {
          // alert
          sweetEffectAlert.play();
          Swal.fire('Notificación', `${usuario.mensaje}`, 'warning');
        } else {
          // console.log(usuario);
          this.store.dispatch(userActions.crearToken({ token: usuario.token }));

          const estado: boolean = usuario.usuarioDB.estado;

          if (estado) {
            this.router.navigateByUrl('/dashboard');
          } else {
            this.router.navigateByUrl('/no-permitido');
          }
          // this.router.navigateByUrl('/dashboard');
        }
      });
    }
  }

  recuperarPass(): void {
    this.displayDialog = true;
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.formaResetPass.controls.email.reset();
  }

  btnRecuperarPass(): void {
    if (!this.validarRecuperarPass.valido) {
      this.formaResetPass.markAllAsTouched();
      return;
    }

    this.store.dispatch(loadinActions.cargarLoading());

    const data = {
      correo: (
        this.formaResetPass.controls.email.value as string
      ).toLocaleLowerCase(),
      reset_pass: true,
    };

    this.userService.recuperarPassword(data).subscribe((resp) => {
      if (resp.ok) {
        this.displayDialog = false;
        this.formaResetPass.controls.email.reset();
        Swal.fire(
          'Mensaje',
          'Un enlace para recuperar su contraseña ha sido enviado a su correo electrónico',
          'warning'
        );
        this.store.dispatch(loadinActions.quitarLoading());
      } else {
        this.displayDialog = false;
        this.formaResetPass.controls.email.reset();
        Swal.fire(
          'Mensaje',
          'Hubo un error al tratar de recuperar su contraseña, intentelo más tarde',
          'error'
        );
        this.store.dispatch(loadinActions.quitarLoading());
      }
    });
  }
}
