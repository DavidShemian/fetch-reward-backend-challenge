import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../bases/entity.base';

@Entity()
export default class PayerEntity extends BaseEntity {
    @Column({ unique: true, nullable: false })
    public name!: string;

    constructor(name: string) {
        super();

        this.name = name;
    }
}
