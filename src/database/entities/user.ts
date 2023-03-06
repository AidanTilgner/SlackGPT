import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiKey } from "./apikey";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  slack_id!: string;

  @Column({
    nullable: true,
  })
  first_name!: string;

  @Column({
    nullable: true,
  })
  last_name!: string;

  @Column({
    nullable: true,
  })
  email!: string;

  @Column({
    nullable: true,
  })
  team_id!: string;

  @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
  api_keys!: ApiKey[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
