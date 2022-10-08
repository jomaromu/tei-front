import validator from 'validator';

export class Validaciones {
  constructor() {}

  // ================================== campo texto ================================== //
  validarTexto({
    requerido = true,
    size = false,
    value,
    minSize = 1,
    maxSize = 10,
  }: ParamsTexto): ValidarTexto {
    const resp: ValidarTexto = {
      valido: false,
      value: '',
      mensaje: '',
    };

    const respReq = this.textRequerido(requerido, value);
    const respSize = this.sizeValue(value, minSize, maxSize);

    const evaluaReqSize = () => {
      if (respReq.valido && respSize.valido) {
        resp.valido = true;
        resp.value = value;
      } else if (respReq.valido && !respSize.valido) {
        resp.valido = false;
        resp.mensaje = respSize.mensaje;
      } else if (!respReq.valido && respSize.valido) {
        resp.valido = false;
        resp.mensaje = respReq.mensaje;
      } else if (!respReq.valido && !respSize.valido) {
        resp.valido = false;
        resp.mensaje = `${respReq.mensaje}, ${respSize.mensaje}`;
      }
    };

    if (requerido && size) {
      evaluaReqSize();
    } else if (requerido && !size) {
      if (respReq.valido) {
        resp.valido = true;
        resp.value = value;
      } else {
        resp.valido = false;
        resp.mensaje = respReq.mensaje;
      }
    } else if (!requerido && size) {
      if (respSize.valido) {
        resp.valido = true;
        resp.value = value;
      } else {
        resp.valido = false;
        resp.mensaje = respSize.mensaje;
      }
    } else if (!requerido && !size) {
      resp.valido = true;
      resp.value = value;
    }

    return resp;
  }
  // ================================== fin campo texto ================================== //

  // ================================== campo number ================================== //

  validarNumber({
    requerido = true,
    size = false,
    value,
    minSize = 1,
    maxSize = 10,
  }: ParamsTexto): ValidarTexto {
    const resp: ValidarTexto = {
      valido: false,
      value: '',
      mensaje: '',
    };

    if (!value) {
      value = '';
    }
    const valNumber = validator.isNumeric(value.toString());

    if (requerido) {
      if (valNumber) {
        const respReq = this.numRequerido(requerido, value);
        const respSize = this.sizeValue(value, minSize, maxSize);

        const evaluaReqSize = () => {
          if (respReq.valido && respSize.valido) {
            resp.valido = true;
            resp.value = value;
          } else if (respReq.valido && !respSize.valido) {
            resp.valido = false;
            resp.mensaje = respSize.mensaje;
          } else if (!respReq.valido && respSize.valido) {
            resp.valido = false;
            resp.mensaje = respReq.mensaje;
          } else if (!respReq.valido && !respSize.valido) {
            resp.valido = false;
            resp.mensaje = `${respReq.mensaje}, ${respSize.mensaje}`;
          }
        };

        if (requerido && size) {
          evaluaReqSize();
        } else if (requerido && !size) {
          if (respReq.valido) {
            resp.valido = true;
            resp.value = value;
          } else {
            resp.valido = false;
            resp.mensaje = respReq.mensaje;
          }
        } else if (!requerido && size) {
          if (respSize.valido) {
            resp.valido = true;
            resp.value = value;
          } else {
            resp.valido = false;
            resp.mensaje = respSize.mensaje;
          }
        } else if (!requerido && !size) {
          resp.valido = true;
          resp.value = value;
        }
      } else {
        resp.valido = false;
        resp.mensaje = 'Sólo un números';
      }
    } else {
      if (valNumber || value === '') {
        const respReq = this.numRequerido(requerido, value);
        const respSize = this.sizeValue(value, minSize, maxSize);

        const evaluaReqSize = () => {
          if (respReq.valido && respSize.valido) {
            resp.valido = true;
            resp.value = value;
          } else if (respReq.valido && !respSize.valido) {
            resp.valido = false;
            resp.mensaje = respSize.mensaje;
          } else if (!respReq.valido && respSize.valido) {
            resp.valido = false;
            resp.mensaje = respReq.mensaje;
          } else if (!respReq.valido && !respSize.valido) {
            resp.valido = false;
            resp.mensaje = `${respReq.mensaje}, ${respSize.mensaje}`;
          }
        };

        if (requerido && size) {
          evaluaReqSize();
        } else if (requerido && !size) {
          if (respReq.valido) {
            resp.valido = true;
            resp.value = value;
          } else {
            resp.valido = false;
            resp.mensaje = respReq.mensaje;
          }
        } else if (!requerido && size) {
          if (respSize.valido) {
            resp.valido = true;
            resp.value = value;
          } else {
            resp.valido = false;
            resp.mensaje = respSize.mensaje;
          }
        } else if (!requerido && !size) {
          resp.valido = true;
          resp.value = value;
        }
      } else {
        resp.valido = false;
        resp.mensaje = 'Sólo un números';
      }
    }

    return resp;
  }

  // ================================== fin campo number ================================== //

  // ================================== campo select ================================== //

  validarSelect({ requerido, opciones, value }: ParamsSelect): ValidarTexto {
    const resp: ValidarTexto = {
      valido: false,
      value: null,
      mensaje: '',
    };

    let findedSelect: any = null;

    // console.log(requerido, opciones, value);

    if (value) {
      if (opciones) {
        findedSelect = opciones.find((ele) => {
          return ele.id === value.id;
        });
      }
    }

    if (!findedSelect) {
      resp.valido = false;
      resp.mensaje = 'Opción inválida o no existe';
    } else {
      resp.valido = true;
      resp.value = value;
    }

    return resp;
  }
  // ================================== fin campo select ================================== //

  // ================================== campo correo ================================== //

  validarCorreo({ requerido = true, value }: ParamsTexto): ValidarTexto {
    const resp: ValidarTexto = {
      valido: false,
      value: '',
      mensaje: '',
    };

    if (!value) {
      value = '';
    }

    const respReq = this.textRequerido(requerido, value);

    const isCorreoTrue = () => {
      const isCorreo = validator.isEmail(value);

      if (isCorreo) {
        resp.valido = true;
        resp.mensaje = value;
      } else {
        resp.valido = false;
        resp.mensaje = 'Escriba un correo válido';
      }
    };

    if (requerido) {
      if (respReq.valido) {
        isCorreoTrue();
      } else {
        resp.valido = false;
        resp.mensaje = respReq.mensaje;
      }
    }

    if (!requerido && value === '') {
      resp.valido = true;
      resp.mensaje = value;
    }

    if (!requerido && value !== '') {
      isCorreoTrue();
    }

    return resp;
  }
  // ================================== fin campo correo ================================== //

  // ================================== campo fecha ====================================== //
  validarFecha({ requerido, value }: ParamsFecha): ValidarTexto {
    const resp: ValidarTexto = {
      valido: false,
      value: '',
      mensaje: '',
    };

    const respReq = this.textRequerido(requerido, value);

    if (respReq.valido) {
      (resp.valido = true), (resp.mensaje = value);
    } else {
      (resp.valido = false), (resp.mensaje = 'Seleccione una fecha');
    }

    return resp;
  }
  // ================================== fin campo fecha ================================== //

  // ================================== validaciones generales ================================== //

  textRequerido(requerido: boolean, value: string): ObjResp {
    const resp: ObjResp = {
      valido: false,
      mensaje: '',
    };
    if (requerido) {
      if (this.hayTexto(value)) {
        resp.valido = true;
        resp.mensaje = value;
      } else {
        resp.valido = false;
        resp.mensaje = 'Escriba un texto';
      }
    } else {
      resp.valido = true;
      resp.mensaje = value;
    }

    return resp;
  }

  // ================================== campo file ================================== //
  validarArchivo(value: File): ValidarTexto {
    const resp: ValidarTexto = {
      valido: false,
      value: '',
      mensaje: '',
    };

    if (!value) {
      resp.valido = false;
      resp.mensaje = 'Debe cargar un archivo';
    } else {
      resp.valido = true;
      resp.value = value;
    }

    return resp;
  }
  // ================================== fint file ================================== //

  // ================================== fin validaciones generales ================================== //

  numRequerido(requerido: boolean, value: string): ObjResp {
    const resp: ObjResp = {
      valido: false,
      mensaje: '',
    };
    if (requerido) {
      if (this.hayTexto(value)) {
        resp.valido = true;
        resp.mensaje = value;
      } else {
        resp.valido = false;
        resp.mensaje = 'Sólo un números';
      }
    } else {
      resp.valido = true;
      resp.mensaje = value;
    }

    return resp;
  }

  hayTexto(value: string): boolean {
    if (!value) {
      value = '';
    }
    if (value === '') {
      return false;
    } else {
      return true;
    }
  }

  sizeValue(value: string, minSize: number, maxSize: number): ObjResp {
    if (!value) {
      value = '';
    }
    const sizeVal = value.length;
    const resp: ObjResp = {
      valido: false,
      mensaje: '',
    };

    if (sizeVal < minSize || sizeVal > maxSize) {
      resp.valido = false;
      resp.mensaje = `(Mínimo ${minSize}, máximo ${maxSize} carácteres)`;
    } else {
      resp.valido = true;
      resp.mensaje = '';
    }

    return resp;
  }
}

/* Interfaces */

// validarTexto
export interface ValidarTexto {
  valido: boolean;
  value: any;
  mensaje: string;
}

interface ParamsTexto {
  requerido: boolean;
  value: string;
  size?: boolean;
  minSize?: number;
  maxSize?: number;
}

interface ParamsSelect {
  requerido: boolean;
  opciones: Array<any>;
  value: any;
}

interface ParamsFecha {
  requerido: boolean;
  value: any;
}

//  validaciones generales
export interface ObjResp {
  valido: boolean;
  mensaje: string;
}
