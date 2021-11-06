import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne } from 'typeorm';
import { IsString, IsInt, IsDateString } from 'class-validator';
import BaseEntity from '../../../bases/entity.base';
import PayerEntity from '../../payer/entities/payers.entity';

@Entity()
export default class TransactionEntity extends BaseEntity {
    @ApiProperty()
    @IsString()
    public payer?: string;

    @ManyToOne(() => PayerEntity)
    public payerEntity!: PayerEntity;

    @ApiProperty()
    @IsInt()
    @Column()
    public points!: number;

    @ApiProperty()
    @IsDateString()
    @Column()
    public timestamp!: string;
}