import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { AppState } from '../../reducers/globarReducers';
import * as loginActions from '../../reducers/login/login.actions';
import anime from 'animejs/lib/anime.es.js';
import { UsuarioWorker } from '../../interfaces/resp-worker';
import { Subscription } from 'rxjs';
import * as menuActions from '../../reducers/abrir-cerrar-sidebar/abrir-cerrar-sidebar-actions';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewChecked {
  @ViewChild('catalogo', { static: true }) catalogo: ElementRef<HTMLElement>;
  @ViewChild('wrapSidebar', { static: true })
  wrapSidebar: ElementRef<HTMLElement>;
  usuario: UsuarioWorker;
  sub1: Subscription;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.cargarWorker();
    this.animacionRow();
  }

  cerrarSidebar(): void {
    this.store.dispatch(menuActions.abrirCerrarSidebar());
  }

  ngAfterViewChecked(): void {
    this.sub1 = this.store
      .select('login')
      // .pipe(take(2))
      .subscribe((worker) => {
        this.usuario = worker.usuarioDB;
      });
  }

  animacionRow(): void {
    // if (this.role === 'AdminRole' || this.role === 'SuperRole') {

    setTimeout(() => {
      if (document.getElementById('catalogo') !== null) {
        const catalogo = document.getElementById('catalogo');
        const pedidos = document.getElementById('pedidos');
        const reporte = document.getElementById('reporte');

        catalogo.addEventListener('click', (e) => {
          const isShow = catalogo.getAttribute('aria-expanded');
          const rowCatalogo = document.getElementById('row-catalogo');

          if (isShow === 'true') {
            anime({
              targets: rowCatalogo,
              rotateZ: 90,
              easing: 'linear',
              duration: 200,
            });
          } else {
            anime({
              targets: rowCatalogo,
              rotateZ: 0,
              easing: 'linear',
              duration: 200,
            });
          }
        });

        // pedidos.addEventListener('click', (e) => {
        //   const isShow = pedidos.getAttribute('aria-expanded');
        //   const rowPedidos = document.getElementById('row-pedidos');

        //   if (isShow === 'true') {
        //     anime({
        //       targets: rowPedidos,
        //       rotateZ: 90,
        //       easing: 'linear',
        //       duration: 200,
        //     });
        //   } else {
        //     anime({
        //       targets: rowPedidos,
        //       rotateZ: 0,
        //       easing: 'linear',
        //       duration: 200,
        //     });
        //   }
        // });

        // reporte.addEventListener('click', (e) => {
        //   const isShow = reporte.getAttribute('aria-expanded');
        //   const rowReportes = document.getElementById('row-reportes');

        //   if (isShow === 'true') {
        //     anime({
        //       targets: rowReportes,
        //       rotateZ: 90,
        //       easing: 'linear',
        //       duration: 200,
        //     });
        //   } else {
        //     anime({
        //       targets: rowReportes,
        //       rotateZ: 0,
        //       easing: 'linear',
        //       duration: 200,
        //     });
        //   }
        // });
      }
    }, 800);
  }

  cargarWorker(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.store.dispatch(
          loginActions.obtenerToken({ token: usuario.token })
        );
      });
  }

  // irACatalogo(pathPrincipal: string, categoria: string): void {
  //   this.router.navigate([`${pathPrincipal}`], {
  //     queryParams: { cat: categoria },
  //   });
  // }

  salir(): void {
    localStorage.clear();
    window.location.reload();
  }
}
