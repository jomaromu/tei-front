import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CurrencyPipe } from '@angular/common';

// Modulos externo
import { LoginModule } from './pages/login/login.module';
import { DashboardModule } from './pages/dashboard/dashboard.module';

// NGRX
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { globalReducerApp } from './reducers/globarReducers';

import { EffectsModule } from '@ngrx/effects';
import { effectsArray } from './services/index';

// socket
// import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { SocketIoModule } from 'ngx-socket-io';

// Servicios
import { PedidoSocketService } from './services/sockets/pedido-socket.service';
import { SucursalesSocketService } from './services/sockets/sucursales-socket.service';
import { PagosSocketService } from './services/sockets/pagos-socket.service';
import { ArchivosSocketService } from './services/sockets/archivos-socket.service';
import { ProductoPedidoSocket } from './services/sockets/productos-pedido.service';
// import { InterceptorService } from './services/interceptor/interceptor.service';

// const config: SocketIoConfig = { url: environment.url, options: {} };

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    EffectsModule.forRoot(effectsArray),
    StoreModule.forRoot(globalReducerApp, {}),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
    // SocketIoModule.forRoot(config)
    SocketIoModule,
    LoginModule,
    DashboardModule,
    BrowserAnimationsModule,
  ],
  providers: [
    CurrencyPipe,
    // { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    PedidoSocketService,
    SucursalesSocketService,
    PagosSocketService,
    ArchivosSocketService,
    ProductoPedidoSocket,
  ],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
