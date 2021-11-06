import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseDAL from '../../bases/dal.base';
import { Repository } from 'typeorm';
import PayerEntity from './entities/payers.entity';

@Injectable()
export default class PayerDal extends BaseDAL {
    constructor(@InjectRepository(PayerEntity) private payerEntity: Repository<PayerEntity>) {
        super();
    }

    public async createPayer(payer: PayerEntity): Promise<PayerEntity> {
        return this.payerEntity.save(payer);
    }

    public async getPayersByName(name: string): Promise<PayerEntity | undefined> {
        return this.payerEntity.findOne({ name });
    }
}
