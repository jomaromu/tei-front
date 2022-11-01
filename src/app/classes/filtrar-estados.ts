import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class FiltrarEstados {
  constructor() {}

  filtrarActivos<Type>(catalogo: Array<Type>): Array<Type> {
    const filtrados = _.filter(catalogo, ['estado', true]);
    return filtrados;
  }
}
