import { Injectable } from '@nestjs/common';
import PayerDal from './payer.dal';
import BaseService from '../../bases/service.base';
import PayerEntity from './entities/payers.entity';

@Injectable()
export default class PayerService extends BaseService {
    constructor(private readonly payerDal: PayerDal) {
        super();
    }

    public async createPayer(name: string): Promise<PayerEntity> {
        return this.payerDal.createPayer(new PayerEntity(name));
    }

    public async getPayerByName(name: string): Promise<PayerEntity | undefined> {
        return this.payerDal.getPayersByName(name);
    }
}
