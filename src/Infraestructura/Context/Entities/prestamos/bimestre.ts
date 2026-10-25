import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cat_bimestres')
export class Bimestre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column()
  mes: number; 
}