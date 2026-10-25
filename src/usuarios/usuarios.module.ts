import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../Infraestructura/Context/Entities/usuarios/usuario.js';
import { Rol } from '../Infraestructura/Context/Entities/usuarios/rol.js';

import { UsuariosController } from './usuarios.controller.js'; 
import { UsuariosPresenter } from '../Presenters/usuarios/usuarios-presenter.js';
import { UsuarioRepository } from '../Infraestructura/Context/usuario-repository.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol])
  ],
  controllers: [UsuariosController],
  providers: [UsuariosPresenter, UsuarioRepository],
})
export class UsuariosModule {}