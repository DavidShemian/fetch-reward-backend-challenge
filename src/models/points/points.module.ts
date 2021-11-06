import PointsDAL from './points.dal';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PointsController from './points.controller';
import PointsService from './points.service';
import PayerPointsEntity from './entities/payers-points.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PayerPointsEntity])],
    controllers: [PointsController],
    providers: [PointsService, PointsDAL],
    exports: [PointsService],
})
export default class PointsModule {}
