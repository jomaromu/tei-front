import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { mergeMap } from 'rxjs/operators';
import { Validaciones, ValidarTexto } from 'src/app/classes/validaciones';
import { Usuario, UsuarioWorker } from 'src/app/interfaces/resp-worker';
import { AppState } from 'src/app/reducers/globarReducers';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import * as loadingActions from '../../../reducers/loading/loading.actions';

@Component({
  selector: 'app-recuperar-pass',
  templateUrl: './recuperar-pass.component.html',
  styleUrls: ['./recuperar-pass.component.scss'],
})
export class RecuperarPassComponent implements OnInit {
  usuario: UsuarioWorker;
  forma: FormGroup;
  displayDialog = false;
  passIguales = false;
  passIgualesLabel = '';

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private validadores: Validaciones,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setLocalToken();
    this.crearFormulario();
  }

  setLocalToken(): void {
    this.route.queryParamMap.subscribe((params) => {
      const hastToken = params.has('token');

      if (hastToken) {
        const token = params.get('token');

        this.userService.decodificarToken(token).subscribe((resp) => {
          if (!resp.ok) {
            this.router.navigateByUrl('/not-found');
          }
        });
      } else {
        this.router.navigateByUrl('/not-found');
      }
    });
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      oldPass: [],
      newPass: [],
    });
  }

  limpiarFormulario(): void {
    this.forma.controls.oldPass.reset();
    this.forma.controls.newPass.reset();
  }

  showDialog(): void {
    this.displayDialog = true;
    this.limpiarFormulario();
  }

  closeDialog(): void {
    this.displayDialog = false;
  }

  get validarNewPass(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: true,
      size: true,
      minSize: 8,
      maxSize: 20,
      value: this.forma.controls.newPass.value,
    });
  }

  get validarOldPass(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: true,
      size: true,
      minSize: 8,
      maxSize: 20,
      value: this.forma.controls.oldPass.value,
    });
  }

  btnGuardar(): void {
    if (!this.validarNewPass.valido || !this.validarOldPass.valido) {
      this.passIgualesLabel = '';
      this.forma.markAllAsTouched();
      return;
    }

    this.store.dispatch(loadingActions.cargarLoading());

    this.passIguales =
      (this.forma.controls.newPass.value as string).toLowerCase() ===
      (this.forma.controls.oldPass.value as string).toLocaleLowerCase();

    if (!this.passIguales) {
      this.passIgualesLabel = 'Las contraseñas no son iguales';
      return;
    }

    const resp = this.route.queryParams.pipe(
      mergeMap((token) =>
        this.userService.decodificarToken(token.token).pipe(
          mergeMap((usuarioDecoded: Usuario) => {
            const data = {
              token: usuarioDecoded.token,
              id: usuarioDecoded.usuarioDB._id,
              password: this.forma.controls.newPass.value,
              reset_pass: false,
            };
            return this.userService.editarPassword(data);
          })
        )
      )
    );

    resp.subscribe((usuario) => {
      if (usuario.ok) {
        this.displayDialog = false;
        Swal.fire('Mensaje', 'Contraseña editada', 'success');
        this.router.navigateByUrl('/login');

        this.limpiarFormulario();
        this.store.dispatch(loadingActions.quitarLoading());
      } else {
        Swal.fire('Mensaje', 'Error editar la contraseña', 'error');
        this.store.dispatch(loadingActions.quitarLoading());
      }

      if (!usuario) {
        Swal.fire('Mensaje', 'Error editar la contraseña', 'error');
        this.store.dispatch(loadingActions.quitarLoading());
      }
    });
  }

  ngOnDestroy(): void {
    localStorage.clear();
  }
}
