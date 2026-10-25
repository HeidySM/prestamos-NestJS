import * as typeorm from 'typeorm';
import { Prestamos } from '../prestamos/prestamos.js';
import { Rol } from './rol.js';

@typeorm.Entity('usuarios')
export class Usuario {
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column()
  nombre: string;

  @typeorm.ManyToOne(() => Rol, rol => rol.usuarios)
  @typeorm.JoinColumn({ name: 'rol_id' })
  rol: typeorm.Relation<Rol>;

  @typeorm.Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sueldoBase: number;

  @typeorm.OneToMany(() => Prestamos, prestamo => prestamo.usuario)
  prestamos: typeorm.Relation<Prestamos>[];
}