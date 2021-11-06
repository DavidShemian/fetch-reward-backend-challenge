import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PayerModule from '../payer/payer.module';
import PointsModule from '../points/points.module';
import TransactionEntity from './entities/transactions.entity';
import TransactionDAL from './transaction.dal';
import TransactionsController from './transactions.controller';
import TransactionsService from './transactions.service';

@Module({
    imports: [PayerModule, PointsModule, TypeOrmModule.forFeature([TransactionEntity])],
    controllers: [TransactionsController],
    providers: [TransactionsService, TransactionDAL],
})
export default class TransactionsModule {}
