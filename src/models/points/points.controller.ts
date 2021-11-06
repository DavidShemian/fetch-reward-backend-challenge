import { Body, Controller, Get, Post } from '@nestjs/common';
import PointsService from './points.service';
import BaseController from '../../bases/controller.base';
import { ISuccessfulResponse } from '../../interfaces/successful-response.interface';
import SpendPointsDTO from './DTO/spend-points.dto';
import { ApiResponse } from '@nestjs/swagger';
import PayerPointsBalance from './types/payer-points-balance.class';
import SpentReport from './types/spent-report.class';

@Controller('points')
export default class PointsController extends BaseController {
    constructor(private readonly pointsService: PointsService) {
        super();
    }

    @Get()
    @ApiResponse({ type: PayerPointsBalance })
    public async getAllPayersPointsBalance(): Promise<ISuccessfulResponse<PayerPointsBalance>> {
        const result = await this.pointsService.getPayersPointsBalance();

        return this.responseSuccess('Successfully returned points balance', result);
    }

    @Post('spend')
    public async spendPoints(@Body() { points }: SpendPointsDTO): Promise<ISuccessfulResponse<SpentReport[]>> {
        const result = await this.pointsService.spendPoints(points);

        return this.responseSuccess('Successfully spent points', result);
    }
}
