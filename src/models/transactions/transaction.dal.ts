import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseDAL from '../../bases/dal.base';
import { Repository } from 'typeorm';
import TransactionEntity from './entities/transactions.entity';

@Injectable()
export default class TransactionDAL extends BaseDAL {
    constructor(@InjectRepository(TransactionEntity) private transactionEntity: Repository<TransactionEntity>) {
        super();
    }

    public async createTransaction(transaction: TransactionEntity): Promise<TransactionEntity> {
        return this.transactionEntity.save(transaction);
    }
}
