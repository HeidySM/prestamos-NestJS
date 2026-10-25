import { Injectable } from '@nestjs/common';
import { PrestamoRepository } from '../../Infraestructura/Context/prestamo-repository.js';
import { MensajesResponse, MensajesData, MensajesAttributes } from '../../Domain/dtos/responses/mensajes-response.js';
import { BimestresResponse, BimestresData, BimestresAttributes } from '../../Domain/dtos/responses/bimestres-response.js';
import { Prestamos } from '../../Infraestructura/Context/Entities/prestamos/prestamos.js';
import { SolicitudPrestamoRequest } from '../../Domain/dtos/requests/solicitud-prestamo.request.js';
import { ActualizarPrestamoRequest } from '../../Domain/dtos/requests/actualizar-prestamo.request.js';

@Injectable()
export class PrestamosPresenter {
  
  private readonly estrategiasDeCalculo: Record<string, (sueldo: number | null, aguinaldo: boolean) => number> = {
    'alumno': () => 3500.00,
    'trabajador': (sueldo, aguinaldo) => {
      if (!sueldo) throw new Error("El trabajador no tiene un sueldo base");
      let m = sueldo * 0.16;
      if (aguinaldo) m += 2000.00;
      return m;
    }
  };

  constructor(private readonly repo: PrestamoRepository) {}

  public async Get(_usuario: number): Promise<any> {
    if (await this.repo.Exists(_usuario)) {
      let b = await this.repo.GetBimestres(_usuario);
      
      let successResponse = new BimestresResponse();
      successResponse.data = new BimestresData();
      successResponse.data.type = 'Prestamos';
      successResponse.data.attributes = new BimestresAttributes();
      successResponse.data.attributes.bimestres = b;

      return { status: 200, response: successResponse };
    }
    
    let errorResponse = new MensajesResponse();
    errorResponse.data = new MensajesData();
    errorResponse.data.type = 'Prestamos';
    errorResponse.data.attributes = new MensajesAttributes();
    errorResponse.data.attributes.mensaje = "No existen bimestres";

    return { status: 400, response: errorResponse };
  }

  public async Solicitar(request: SolicitudPrestamoRequest): Promise<any> {
    const usuario = await this.repo.GetUsuario(request.usuarioId);
    if (!usuario) return this.generarRespuestaMensaje(404, "El usuario no existe");

    const catalogo = await this.repo.ObtenerCatalogoBimestres();
    const bimestresYaSolicitados = await this.repo.GetBimestres(usuario.id);
    
    const mesActual = new Date().getMonth() + 1; 
    let bimestresNuevos = []; 
    let aplicaAguinaldo = false;
    const nombreRol = usuario.rol.nombre.toLowerCase();

    for (const nombreBimestre of request.bimestres) {
      const nombreBuscado = nombreBimestre.toLowerCase();
      const bimestreDb = catalogo.find(cat => cat.nombre.toLowerCase() === nombreBuscado);
      
      if (!bimestreDb) return this.generarRespuestaMensaje(400, `El bimestre '${nombreBimestre}' no es válido.`);
      if (bimestreDb.mes < mesActual) return this.generarRespuestaMensaje(400, `El bimestre '${nombreBimestre}' ya transcurrió.`);

      if (nombreBuscado === 'diciembre') {
        if (nombreRol !== 'trabajador') return this.generarRespuestaMensaje(400, "Diciembre es exclusivo para trabajadores.");
        aplicaAguinaldo = true;
      }

      if (!bimestresYaSolicitados.includes(bimestreDb.nombre)) {
        bimestresNuevos.push(bimestreDb);
      }
    }

    if (!this.estrategiasDeCalculo[nombreRol]) {
      return this.generarRespuestaMensaje(400, "Rol no reconocido");
    }

    let monto = 0;
    try {
      monto = this.estrategiasDeCalculo[nombreRol](usuario.sueldoBase, aplicaAguinaldo);
    } catch (error: any) {
      return this.generarRespuestaMensaje(400, error.message);
    }

    if (bimestresNuevos.length > 0) {
      const registrosAInsertar = bimestresNuevos.map(bimestre => {
        let nuevoRegistro = new Prestamos();
        nuevoRegistro.usuario = usuario as any;
        nuevoRegistro.bimestre = bimestre as any;
        nuevoRegistro.montoTotal = monto;
        return nuevoRegistro;
      });
      
      await this.repo.GuardarPrestamos(registrosAInsertar);
    }

    return this.generarRespuestaMensaje(201, `Préstamo aprobado por un monto de $${monto}`);
  }

  public async Cancelar(idPrestamo: number): Promise<any> {
    const prestamo = await this.repo.GetPrestamoById(idPrestamo);
    if (!prestamo) {
      return this.generarRespuestaMensaje(404, `El préstamo con ID ${idPrestamo} no existe o ya fue cancelado.`);
    }
    await this.repo.EliminarPrestamo(idPrestamo);
    return this.generarRespuestaMensaje(200, "El préstamo ha sido cancelado exitosamente.");
  }

  private generarRespuestaMensaje(statusCode: number, mensaje: string) {
    let response = new MensajesResponse();
    response.data = new MensajesData();
    response.data.type = 'Prestamos';
    response.data.attributes = new MensajesAttributes();
    response.data.attributes.mensaje = mensaje;
    
    return { status: statusCode, response: response };
  }

  public async Actualizar(idPrestamo: number, request: ActualizarPrestamoRequest): Promise<any> {
    const prestamo = await this.repo.GetPrestamoById(idPrestamo);
    if (!prestamo) return this.generarRespuestaMensaje(404, "El préstamo no existe.");

    const catalogo = await this.repo.ObtenerCatalogoBimestres();
    const nombreBuscado = request.nuevoBimestre.toLowerCase();
    const nuevoBimestreDb = catalogo.find(cat => cat.nombre.toLowerCase() === nombreBuscado);

    if (!nuevoBimestreDb) return this.generarRespuestaMensaje(400, `El bimestre '${request.nuevoBimestre}' no es válido.`);
    
    const mesActual = new Date().getMonth() + 1;
    if (nuevoBimestreDb.mes < mesActual) return this.generarRespuestaMensaje(400, `El bimestre '${request.nuevoBimestre}' ya transcurrió.`);
    
    const usuario = prestamo.usuario;
    const nombreRol = usuario.rol.nombre.toLowerCase();
    let aplicaAguinaldo = false;

    if (nombreBuscado === 'diciembre') {
      if (nombreRol !== 'trabajador') return this.generarRespuestaMensaje(400, "Diciembre es exclusivo para trabajadores.");
      aplicaAguinaldo = true;
    }

    const bimestresYaSolicitados = await this.repo.GetBimestres(usuario.id);
    if (bimestresYaSolicitados.includes(nuevoBimestreDb.nombre) && prestamo.bimestre.nombre !== nuevoBimestreDb.nombre) {
      return this.generarRespuestaMensaje(400, `El usuario ya tiene un préstamo activo para '${nuevoBimestreDb.nombre}'.`);
    }

    if (!this.estrategiasDeCalculo[nombreRol]) {
      return this.generarRespuestaMensaje(400, "Rol no reconocido");
    }

    let monto = 0;
    try {
      monto = this.estrategiasDeCalculo[nombreRol](usuario.sueldoBase, aplicaAguinaldo);
    } catch (error: any) {
      return this.generarRespuestaMensaje(400, error.message);
    }

    prestamo.bimestre = nuevoBimestreDb as any;
    prestamo.montoTotal = monto;

    await this.repo.ActualizarPrestamo(prestamo);

    return this.generarRespuestaMensaje(200, `Préstamo actualizado exitosamente al bimestre ${nuevoBimestreDb.nombre}. Nuevo monto: $${monto}`);
  }
}