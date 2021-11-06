import { Body, Controller, Get, Post } from '@nestjs/common';
import PayerPointsService from './payer-points.service';
import BaseController from '../../bases/controller.base';
import { ISuccessfulResponse } from '../../interfaces/successful-response.interface';
import SpendPointsDTO from './DTO/spend-points.dto';
import { ApiResponse } from '@nestjs/swagger';
import PayerPointsBalance from './types/payer-points-balance.class';
import SpentReport from './types/spent-report.class';

@Controller('points')
export default class PayerPointsController extends BaseController {
    constructor(private readonly payerPointsService: PayerPointsService) {
        super();
    }

    @Get()
    @ApiResponse({ type: PayerPointsBalance })
    public async getAllPayersPointsBalance(): Promise<ISuccessfulResponse<PayerPointsBalance>> {
        const result = await this.payerPointsService.getPayersPointsBalance();

        return this.responseSuccess('Successfully returned points balance', result);
    }

    @Post('spend')
    public async spendPoints(@Body() { points }: SpendPointsDTO): Promise<ISuccessfulResponse<SpentReport[]>> {
        const result = await this.payerPointsService.spendPoints(points);

        return this.responseSuccess('Successfully spent points', result);
    }
}
