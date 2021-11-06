import { Column, Entity, ManyToOne } from 'typeorm';
import BaseEntity from '../../../bases/entity.base';
import PayerEntity from '../../payer/entities/payers.entity';

@Entity()
export default class PayerPointsEntity extends BaseEntity {
    @ManyToOne(() => PayerEntity, { nullable: false })
    public payer!: PayerEntity;

    @Column({ nullable: false, default: 0 })
    public points!: number;

    @Column({ nullable: false })
    public timestamp!: string;

    constructor(payer: PayerEntity, points: number, timestamp: string) {
        super();

        this.payer = payer;
        this.points = points;
        this.timestamp = timestamp;
    }
}
