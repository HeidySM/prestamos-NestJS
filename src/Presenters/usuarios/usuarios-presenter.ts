import { Injectable } from '@nestjs/common';
import { UsuarioRepository } from '../../Infraestructura/Context/usuario-repository.js';
import { CrearUsuarioRequest } from '../../Domain/dtos/requests/crear-usuario.request.js';
import { ActualizarUsuarioRequest } from '../../Domain/dtos/requests/actualizar-usuario.request.js';
import { Usuario } from '../../Infraestructura/Context/Entities/usuarios/usuario.js';

@Injectable()
export class UsuariosPresenter {
  constructor(private readonly repo: UsuarioRepository) {}

  private generarRespuestaMensaje(statusCode: number, mensaje: string) {
    return {
      status: statusCode,
      response: { data: { type: 'Usuarios', attributes: { mensaje } } }
    };
  }

  public async ObtenerUsuarios(): Promise<any> {
    const usuarios = await this.repo.ObtenerTodos();
    const formatoRespuesta = {
      data: {
        type: 'Usuarios',
        attributes: usuarios.map(u => ({
          nombre: u.nombre,
          rol: u.rol ? u.rol.nombre : 'Sin rol asignado',
          sueldoBase: u.sueldoBase
        }))
      }
    };
    return { status: 200, response: formatoRespuesta };
  }

  public async Crear(request: CrearUsuarioRequest): Promise<any> {
    const rolDb = await this.repo.GetRolByNombre(request.rol);
    if (!rolDb) return this.generarRespuestaMensaje(400, `El rol '${request.rol}' no existe.`);
    const usuarioDuplicado = await this.repo.ValidarDuplicado(request.nombre, rolDb.id);
    if (usuarioDuplicado) {
      return this.generarRespuestaMensaje(400, `Ya existe un '${request.rol}' registrado con el nombre '${request.nombre}'.`);
    }

    let nuevoUsuario = new Usuario();
    nuevoUsuario.nombre = request.nombre;
    nuevoUsuario.rol = rolDb as any;
    nuevoUsuario.sueldoBase = (request.sueldoBase || null) as any;

    await this.repo.GuardarUsuario(nuevoUsuario);
    return this.generarRespuestaMensaje(201, "Usuario creado exitosamente.");
  }

  public async Actualizar(id: number, request: ActualizarUsuarioRequest): Promise<any> {
    const usuario = await this.repo.GetUsuarioById(id);
    if (!usuario) return this.generarRespuestaMensaje(404, "Usuario no encontrado.");

    if (request.nombre) usuario.nombre = request.nombre;
    if (request.sueldoBase !== undefined) usuario.sueldoBase = request.sueldoBase;
    
    if (request.rol) {
      const rolDb = await this.repo.GetRolByNombre(request.rol);
      if (!rolDb) return this.generarRespuestaMensaje(400, `El rol '${request.rol}' no existe.`);
      usuario.rol = rolDb as any;
    }

    await this.repo.GuardarUsuario(usuario);
    return this.generarRespuestaMensaje(200, "Usuario actualizado exitosamente.");
  }

  public async Eliminar(id: number): Promise<any> {
    const usuario = await this.repo.GetUsuarioById(id);
    if (!usuario) return this.generarRespuestaMensaje(404, "Usuario no encontrado.");

    try {
      await this.repo.EliminarUsuario(id);
      return this.generarRespuestaMensaje(200, "Usuario eliminado exitosamente.");
    } catch (error) {
      return this.generarRespuestaMensaje(400, "No se puede eliminar el usuario porque tiene préstamos asociados en el sistema.");
    }
  }
}