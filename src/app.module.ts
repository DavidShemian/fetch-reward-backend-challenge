import { Module } from '@nestjs/common';
import PointsModule from './models/payer-points/payer-points.module';
import TransactionsModule from './models/transactions/transactions.module';
import PayerModule from './models/payer/payer.module';
import DBModule from './database/db.module';

@Module({
    imports: [DBModule, PointsModule, TransactionsModule, PayerModule],
    controllers: [],
    providers: [],
})
export default class AppModule {}
