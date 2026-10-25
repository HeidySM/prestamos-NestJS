import { Controller, Get, Post, Put, Delete, Param, Body, Res, ParseIntPipe } from '@nestjs/common';
import express from 'express';
import { UsuariosPresenter } from '../Presenters/usuarios/usuarios-presenter.js';
import { CrearUsuarioRequest } from '../Domain/dtos/requests/crear-usuario.request.js';
import { ActualizarUsuarioRequest } from '../Domain/dtos/requests/actualizar-usuario.request.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly presenter: UsuariosPresenter) {}

  @Get()
  public async obtenerUsuarios(@Res() res: express.Response) {
    const result = await this.presenter.ObtenerUsuarios();
    return res.status(result.status).json(result.response);
  }

  @Post()
  public async crearUsuario(@Body() request: CrearUsuarioRequest, @Res() res: express.Response) {
    const result = await this.presenter.Crear(request);
    return res.status(result.status).json(result.response);
  }

  @Put(':idUsuario')
  public async actualizarUsuario(@Param('idUsuario', ParseIntPipe) id: number, @Body() request: ActualizarUsuarioRequest, @Res() res: express.Response) {
    const result = await this.presenter.Actualizar(id, request);
    return res.status(result.status).json(result.response);
  }

  @Delete(':idUsuario')
  public async eliminarUsuario(@Param('idUsuario', ParseIntPipe) id: number, @Res() res: express.Response) {
    const result = await this.presenter.Eliminar(id);
    return res.status(result.status).json(result.response);
  }
}