import * as typeorm from 'typeorm';
import { Usuario } from './usuario.js';

@typeorm.Entity('roles')
export class Rol {
  toLowerCase() {
    throw new Error('Method not implemented.');
  }
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column({ unique: true })
  nombre: string;

  @typeorm.OneToMany(() => Usuario, usuario => usuario.rol)
  usuarios: typeorm.Relation<Usuario[]>;
}