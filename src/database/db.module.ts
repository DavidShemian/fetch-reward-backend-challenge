import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PayerPointsEntity from '../models/points/entities/payers-points.entity';
import TransactionEntity from '../models/transactions/entities/transactions.entity';
import PayerEntity from '../models/payer/entities/payers.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [TransactionEntity, PayerEntity, PayerPointsEntity],
            synchronize: true,
        }),
    ],
})
export default class DBModule {}
