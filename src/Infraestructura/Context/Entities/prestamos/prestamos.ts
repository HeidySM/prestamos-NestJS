import * as typeorm from 'typeorm';
import { Usuario } from '../usuarios/usuario.js';
import { Bimestre } from './bimestre.js';

@typeorm.Entity('prestamos')
export class Prestamos {
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.ManyToOne(() => Usuario, usuario => usuario.prestamos)
  @typeorm.JoinColumn({ name: 'usuario_id' })
  usuario: typeorm.Relation<Usuario>;

  @typeorm.ManyToOne(() => Bimestre)
  @typeorm.JoinColumn({ name: 'bimestre_id' })
  bimestre: typeorm.Relation<Bimestre>;

  @typeorm.Column({ type: 'decimal', precision: 10, scale: 2 })
  montoTotal: number;

  @typeorm.Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaSolicitud: Date;
}