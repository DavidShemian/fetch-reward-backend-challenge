import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PayerEntity from './entities/payers.entity';
import PayerDal from './payer.dal';
import PayerService from './payer.service';

@Module({
    imports: [TypeOrmModule.forFeature([PayerEntity])],
    providers: [PayerService, PayerDal],
    exports: [PayerService],
})
export default class PayerModule {}
