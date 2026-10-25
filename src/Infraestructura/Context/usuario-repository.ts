import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './Entities/usuarios/usuario.js';
import { Rol } from './Entities/usuarios/rol.js';

@Injectable()
export class UsuarioRepository {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>, // Inyectamos Rol
  ) {}

  public async ObtenerTodos(): Promise<Usuario[]> {
    return await this.usuarioRepo.find({ relations: { rol: true } });
  }

  public async GetUsuarioById(id: number): Promise<Usuario | null> {
    return await this.usuarioRepo.findOne({ where: { id }, relations: { rol: true } });
  }

  public async GetRolByNombre(nombre: string): Promise<Rol | null> {
    return await this.rolRepo.findOne({ where: { nombre } });
  }

  public async GuardarUsuario(usuario: Usuario): Promise<Usuario> {
    return await this.usuarioRepo.save(usuario);
  }

  public async EliminarUsuario(id: number): Promise<void> {
    await this.usuarioRepo.delete(id);
  }
  public async ValidarDuplicado(nombre: string, idRol: number): Promise<boolean> {
    const cantidad = await this.usuarioRepo.count({
      where: {
        nombre: nombre,
        rol: { id: idRol }
      }
    });
    return cantidad > 0;
  }
}