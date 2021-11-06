import PayerPointsDAL from './payer-points.dal';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PayerPointsController from './payer-points.controller';
import PayerPointsService from './payer-points.service';
import PayerPointsEntity from './entities/payers-points.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PayerPointsEntity])],
    controllers: [PayerPointsController],
    providers: [PayerPointsService, PayerPointsDAL],
    exports: [PayerPointsService],
})
export default class PointsModule {}
