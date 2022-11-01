import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { timer } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { UsuarioWorker } from 'src/app/interfaces/resp-worker';
import Swal from 'sweetalert2';
import { Pedido, PedidoDB } from '../../../interfaces/pedido';
import { AppState } from '../../../reducers/globarReducers';
import { PedidoService } from '../../../services/pedido.service';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss'],
})
export class PedidoComponent implements OnInit, OnDestroy {
  pedido: PedidoDB;
  usuario: UsuarioWorker;
  trueCanTabs: number = 0;
  falseCanTabs: number = 0;
  informacion = 'Información';
  productos = 'Productos';
  archivos = 'Archivos';
  seguimiento = 'Seguimiento';
  pagos = 'Pagos';

  verInfo = false;
  verProductos = false;
  verArchivos = false;
  verSeguimiento = false;
  verPagos = false;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private store: Store<AppState>,
    private router: Router,
    private breakPointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.detectarTabs();
    this.legendStyle();
    this.cargarPedido();
    this.cargarObjRestTabs();
    this.mediaQuery();
    this.manejoBarraTabView();
  }

  ngAfterViewInit(): void {
    this.detectarTabs();
    this.cargarPedido();
  }

  cargarPedido(): void {
    this.route.queryParams.subscribe((params) => {
      const id: string = params.id;

      if (!id) {
        this.router.navigateByUrl('/dashboard');
        Swal.fire('Mensaje', 'El pedido que intenta ver no es válido', 'error');

        return;
      }

      this.store
        .select('login')
        // .pipe(first())
        .subscribe((usuario) => {
          if (usuario.usuarioDB) {
            // this.usuario = usuario.usuarioDB;
            // console.log(this.usuario);

            if (id.length > 24 || id.length < 24) {
              this.router.navigateByUrl('/dashboard');
              Swal.fire(
                'Mensaje',
                'El pedido que intenta ver no es válido',
                'error'
              );

              return;
            } else {
              const data = {
                token: usuario.token,
                id,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.pedidoService
                .obtenerPedido(data)
                .subscribe((pedido: Pedido) => {
                  this.pedido = pedido.pedidoDB;
                });
            }
          }
        });
    });
  }

  detectarTabs(): void {
    this.store
      .select('login')
      .pipe(take(2))
      .subscribe((user) => {
        const time = timer(0, 30).subscribe((resp) => {
          const tabs = document.getElementsByClassName('p-tabview-nav');

          const usuario = user.usuarioDB;

          if (usuario) {
            const objtTabs = Object.values({
              informacion:
                usuario?.role?.restricciones?.pedido?.informacion?.verInfo,
              productos: usuario?.role?.restricciones?.pedido?.productos,
              archivos: usuario?.role?.restricciones?.pedido?.archivos,
              seguimiento: usuario?.role?.restricciones?.pedido?.seguimiento,
              pagos: usuario?.role?.restricciones?.pedido?.pagos,
            });

            this.trueCanTabs = objtTabs.filter((item) => item).length;
            this.falseCanTabs = objtTabs.filter((item) => !item).length;

            if (tabs) {
              const tab = tabs[0] as HTMLElement;

              tab.style.display = 'grid';
              tab.style.gridTemplateColumns = `repeat(${this.trueCanTabs}, 1fr)`;

              // console.log(this.trueCanTabs);

              time.unsubscribe();
            }
          }
        });
      });
  }

  legendStyle(): void {
    const time = timer(0, 300).subscribe((resp) => {
      const legends = document.querySelectorAll(
        'legend'
      ) as NodeListOf<HTMLElement>;

      const arrayLegend = Array.from(legends);

      arrayLegend.forEach((legend, index) => {
        if (legend) {
          legend.style.width = '30%';
          legend.style.float = 'none';
          legend.style.marginLeft = '20px';
          legend.style.wordBreak = 'break-all';
          legend.style.fontSize = '1.1rem';
          legend.style.textAlign = 'left';

          const legendSpand = document.querySelectorAll('legend > span')[
            index
          ] as HTMLElement;
          legendSpand.style.justifyContent = 'flex-start';
          time.unsubscribe();
        }
      });
    });
  }

  cargarObjRestTabs(): void {
    this.store.select('login').subscribe((usuario) => {
      if (usuario.usuarioDB) {
        this.verInfo =
          usuario?.usuarioDB?.role?.restricciones?.pedido?.informacion?.verInfo;
        this.verProductos =
          usuario?.usuarioDB?.role?.restricciones?.pedido?.productos;
        this.verArchivos =
          usuario?.usuarioDB?.role?.restricciones?.pedido?.archivos;
        this.verSeguimiento =
          usuario?.usuarioDB?.role?.restricciones?.pedido?.seguimiento;
        this.verPagos = usuario?.usuarioDB?.role?.restricciones?.pedido?.pagos;

        // console.log(this.verInfo);
        // console.log(usuario);
      }
    });
  }

  mediaQuery(): void {
    // 992
    this.breakPointObserver
      .observe(['(max-width: 992px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          const time = timer(0, 300).subscribe((resp) => {
            const legends = document.querySelectorAll(
              'legend'
            ) as NodeListOf<HTMLElement>;

            const arrayLegend = Array.from(legends);

            arrayLegend.forEach((legend, index) => {
              if (legend) {
                legend.style.width = '43%';
                // legend.style.float = 'none';
                // legend.style.marginLeft = '20px';
                // legend.style.wordBreak = 'break-all';
                legend.style.fontSize = '1.1rem';
                // legend.style.textAlign = 'left';

                const legendSpand = document.querySelectorAll('legend > span')[
                  index
                ] as HTMLElement;
                legendSpand.style.justifyContent = 'flex-start';
                time.unsubscribe();
              }
            });
          });
        } else {
          const time = timer(0, 300).subscribe((resp) => {
            const legends = document.querySelectorAll(
              'legend'
            ) as NodeListOf<HTMLElement>;

            const arrayLegend = Array.from(legends);

            arrayLegend.forEach((legend, index) => {
              if (legend) {
                legend.style.width = '30%';
                // legend.style.float = 'none';
                // legend.style.marginLeft = '20px';
                // legend.style.wordBreak = 'break-all';
                legend.style.fontSize = '1.1rem';
                // legend.style.textAlign = 'left';

                const legendSpand = document.querySelectorAll('legend > span')[
                  index
                ] as HTMLElement;
                legendSpand.style.justifyContent = 'flex-start';
                time.unsubscribe();
              }
            });
          });
        }
      });

    // 768
    this.breakPointObserver
      .observe(['(max-width: 768px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          const time = timer(0, 300).subscribe((resp) => {
            const legends = document.querySelectorAll(
              'legend'
            ) as NodeListOf<HTMLElement>;

            const arrayLegend = Array.from(legends);

            arrayLegend.forEach((legend, index) => {
              if (legend) {
                legend.style.width = '41%';
                // legend.style.float = 'none';
                // legend.style.marginLeft = '20px';
                // legend.style.wordBreak = 'break-all';
                legend.style.fontSize = '1rem';
                // legend.style.textAlign = 'left';

                const legendSpand = document.querySelectorAll('legend > span')[
                  index
                ] as HTMLElement;
                legendSpand.style.justifyContent = 'flex-start';
                time.unsubscribe();
              }
            });
          });
        }
      });

    // 576
    this.breakPointObserver
      .observe(['(max-width: 576px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          const time = timer(0, 300).subscribe((resp) => {
            const legends = document.querySelectorAll(
              'legend'
            ) as NodeListOf<HTMLElement>;

            const arrayLegend = Array.from(legends);

            arrayLegend.forEach((legend, index) => {
              if (legend) {
                legend.style.width = '90%';
                // legend.style.float = 'none';
                // legend.style.marginLeft = '20px';
                // legend.style.wordBreak = 'break-all';
                legend.style.fontSize = '1rem';
                // legend.style.textAlign = 'left';

                const legendSpand = document.querySelectorAll('legend > span')[
                  index
                ] as HTMLElement;
                legendSpand.style.justifyContent = 'flex-start';
                time.unsubscribe();
              }
            });
          });
        }
      });
  }

  manejoBarraTabView(): void {
    const time = timer(0, 300).subscribe((resp) => {
      const barra = document.querySelector(
        '.p-tabview .p-tabview-nav .p-tabview-ink-bar'
      ) as HTMLElement;

      if (barra) {
        // console.log(barra);
        barra.style.display = 'none';
        time.unsubscribe();
      }
    });
  }

  ngOnDestroy(): void {}
}
