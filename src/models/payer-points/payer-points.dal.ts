import { Injectable } from '@nestjs/common';
import PayerPointsBalance from './types/payer-points-balance.class';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import PayerPointsEntity from './entities/payers-points.entity';
import PayerEntity from '../payer/entities/payers.entity';
import BaseDAL from '../../bases/dal.base';

@Injectable()
export default class PayerPointsDAL extends BaseDAL {
    constructor(@InjectRepository(PayerPointsEntity) private payerPointsEntity: Repository<PayerPointsEntity>) {
        super();
    }

    public async createPayerPoints(payerPoints: PayerPointsEntity): Promise<PayerPointsEntity> {
        return this.payerPointsEntity.save(payerPoints);
    }

    public async getAllPayerPointsSortedByTimestamp(): Promise<PayerPointsEntity[]> {
        return this.payerPointsEntity.find({ order: { timestamp: 'ASC' }, relations: ['payer'] });
    }

    public async getPayerPointsUntilDate(id: string, to: string): Promise<PayerPointsEntity[]> {
        return this.payerPointsEntity.find({ order: { timestamp: 'ASC' }, where: { timestamp: LessThan(to), payer: { id } } });
    }

    public async getPayersPointsBalance(): Promise<PayerPointsBalance[]> {
        return this.payerPointsEntity
            .createQueryBuilder('payer_points')
            .select(['payer.name as payer', 'sum(payer_points.points) as points'])
            .innerJoin(PayerEntity, 'payer', 'payer.id = payer_points.payerId')
            .groupBy('payer_points.payerId')
            .execute();
    }

    public async updatePayerPoints(payerPoints: PayerPointsEntity[]): Promise<PayerPointsEntity[]> {
        return this.payerPointsEntity.save(payerPoints);
    }
}
