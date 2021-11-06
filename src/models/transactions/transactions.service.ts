import { BadRequestException, Injectable } from '@nestjs/common';
import PointsService from '../points/points.service';
import PayerService from '../payer/payer.service';
import TransactionDAL from './transaction.dal';
import TransactionEntity from './entities/transactions.entity';
import BaseService from '../../bases/service.base';

@Injectable()
export default class TransactionsService extends BaseService {
    constructor(
        private readonly payerService: PayerService,
        private readonly pointsService: PointsService,
        private readonly transactionDAL: TransactionDAL
    ) {
        super();
    }

    /**
     * This function adds new transaction.
     * First, it checks if the transaction is for new player, and if so creates it.
     * If the transaction is negative, it reduce the points, and throws error if the reduction will result in negative value.
     * If the transaction is positive, is simply creates new payerPoints entry
     * Last, it saves the transaction
     * @param transaction - the transaction to add
     * @returns - new added transaction
     */
    public async createTransaction(transaction: TransactionEntity): Promise<TransactionEntity> {
        const { payer, points, timestamp } = transaction;
        let payerFromDB = await this.payerService.getPayerByName(payer as string);

        if (points < 0 && !payerFromDB) {
            throw new BadRequestException('Unable to reduce points from new payer');
        }

        if (!payerFromDB) {
            payerFromDB = await this.payerService.createPayer(payer as string);
        }

        if (points < 0) {
            await this.pointsService.reducePointsFromPayerPoints(points, payerFromDB.id, transaction.timestamp);
        } else {
            await this.pointsService.createPayerPoints(payerFromDB, points, timestamp);
        }

        return this.transactionDAL.createTransaction({
            timestamp: transaction.timestamp,
            points: transaction.points,
            payerEntity: payerFromDB,
            id: transaction.id,
        });
    }
}
