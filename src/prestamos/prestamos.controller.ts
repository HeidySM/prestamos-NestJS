import { Body, Controller, Delete, Get, Param, Post, Res, ParseIntPipe, Put } from '@nestjs/common';
import express from 'express';
import { PrestamosPresenter } from '../Presenters/prestamos/prestamos-presenter.js';
import { SolicitudPrestamoRequest } from '../Domain/dtos/requests/solicitud-prestamo.request.js';
import { ActualizarPrestamoRequest } from '../Domain/dtos/requests/actualizar-prestamo.request.js';

@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly presenter: PrestamosPresenter) {}

  @Get(':idUsuario')
  public async getBimestres(@Param('idUsuario') idUsuario: number, @Res() res: express.Response) {
    const result = await this.presenter.Get(idUsuario);

    return res.status(result.status).json(result.response);
  }
  
  @Post('solicitar')
  public async solicitarPrestamo(@Body() request: SolicitudPrestamoRequest, @Res() res: express.Response) {
    const result = await this.presenter.Solicitar(request);
    return res.status(result.status).json(result.response);
  }
  @Delete(':idPrestamo')
  public async cancelarPrestamo(@Param('idPrestamo', ParseIntPipe) idPrestamo: number, @Res() res: express.Response) {
    const result = await this.presenter.Cancelar(idPrestamo);
    return res.status(result.status).json(result.response);
  }
  @Put(':idPrestamo')
  public async actualizarPrestamo(
    @Param('idPrestamo', ParseIntPipe) idPrestamo: number, 
    @Body() request: ActualizarPrestamoRequest, 
    @Res() res: express.Response
  ) {
    const result = await this.presenter.Actualizar(idPrestamo, request);
    return res.status(result.status).json(result.response);
  }

}