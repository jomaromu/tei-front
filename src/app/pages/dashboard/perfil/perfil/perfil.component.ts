import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { Validaciones, ValidarTexto } from '../../../../classes/validaciones';
import { Usuario, UsuarioWorker } from '../../../../interfaces/resp-worker';
import { AppState } from '../../../../reducers/globarReducers';
import { UserService } from '../../../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  usuario: UsuarioWorker;
  forma: FormGroup;
  displayDialog = false;
  passIguales = false;
  passIgualesLabel = '';
  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private validadores: Validaciones,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarUsuario();
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

  cargarUsuario(): void {
    this.store.select('login').subscribe((usuario) => {
      this.usuario = usuario.usuarioDB;
    });
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

    this.passIguales =
      (this.forma.controls.newPass.value as string) ===
      (this.forma.controls.oldPass.value as string);

    if (!this.passIguales) {
      this.passIgualesLabel = 'Las contraseñas no son iguales';
      return;
    }

    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          this.passIgualesLabel = '';

          const data = {
            id: usuario.usuarioDB._id,
            password: this.forma.controls.newPass.value,
            token: usuario.token,
          };

          this.userService
            .editarPassword(data)
            .subscribe((usuario: Usuario) => {
              if (usuario.ok) {
                // this.store.dispatch(loadingActions.quitarLoading());
                this.displayDialog = false;
                Swal.fire('Mensaje', 'Contraseña editada', 'success');

                this.limpiarFormulario();
              } else {
                Swal.fire('Mensaje', 'Error editar la contraseña', 'error');
                // this.store.dispatch(loadingActions.quitarLoading());
              }

              if (!usuario) {
                Swal.fire('Mensaje', 'Error editar la contraseña', 'error');
                // this.store.dispatch(loadingActions.quitarLoading());
              }
            });
        }
      });
  }
}
