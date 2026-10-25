import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestamos } from './Entities/prestamos/prestamos.js';
import { Usuario } from './Entities/usuarios/usuario.js';
import { Bimestre } from './Entities/prestamos/bimestre.js';

@Injectable()
export class PrestamoRepository {
  constructor(
    @InjectRepository(Prestamos) private readonly prestamosRepo: Repository<Prestamos>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Bimestre) private readonly bimestreRepo: Repository<Bimestre>,
  ) {}

  public async Exists(_usuario: number): Promise<boolean> {
    const count = await this.prestamosRepo.count({ where: { usuario: { id: _usuario } } });
    return count > 0;
  }

  public async GetBimestres(_usuario: number): Promise<string[]> {
    const prestamos = await this.prestamosRepo.find({
      where: { usuario: { id: _usuario } },
      relations: { bimestre: true },
    });
    return prestamos.map(p => p.bimestre.nombre);
  }

  public async GetUsuario(id: number): Promise<Usuario | null> {
    return await this.usuarioRepo.findOne({ where: { id }, relations: { rol: true } });
  }

  public async ObtenerCatalogoBimestres(): Promise<Bimestre[]> {
    return await this.bimestreRepo.find();
  }

  public async GuardarPrestamos(prestamos: Prestamos[]): Promise<void> {
    await this.prestamosRepo.save(prestamos);
  }

  public async GetPrestamoById(id: number): Promise<Prestamos | null> {
    return await this.prestamosRepo.findOne({ 
      where: { id },
      relations: { 
        usuario: { 
          rol: true 
        }, 
        bimestre: true 
      } 
    });
  }

  public async EliminarPrestamo(id: number): Promise<void> {
    await this.prestamosRepo.delete(id);
  }

  public async ActualizarPrestamo(prestamo: Prestamos): Promise<void> {
    await this.prestamosRepo.save(prestamo);
  }
}