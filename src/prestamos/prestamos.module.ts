import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prestamos } from '../Infraestructura/Context/Entities/prestamos/prestamos.js';
import { Usuario } from '../Infraestructura/Context/Entities/usuarios/usuario.js';
import { PrestamoRepository } from '../Infraestructura/Context/prestamo-repository.js';
import { PrestamosPresenter } from '../Presenters/prestamos/prestamos-presenter.js';
import { PrestamosController } from './prestamos.controller.js';
import { Bimestre } from '../Infraestructura/Context/Entities/prestamos/bimestre.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prestamos, Usuario, Bimestre]) 
  ],
  controllers: [PrestamosController],
  providers: [PrestamoRepository, PrestamosPresenter], 
  exports: [PrestamoRepository, PrestamosPresenter], 
})  
export class PrestamosModule {}