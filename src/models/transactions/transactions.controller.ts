import BaseController from '../../bases/controller.base';
import TransactionsService from './transactions.service';
import { Body, Controller, Post } from '@nestjs/common';
import TransactionEntity from './entities/transactions.entity';
import { ISuccessfulResponse } from '../../interfaces/successful-response.interface';
import { ApiProperty } from '@nestjs/swagger';

@Controller('transactions')
export default class TransactionsController extends BaseController {
    constructor(private readonly transactionsService: TransactionsService) {
        super();
    }

    @Post()
    @ApiProperty({ type: TransactionEntity })
    public async addTransaction(@Body() transaction: TransactionEntity): Promise<ISuccessfulResponse<undefined>> {
        await this.transactionsService.createTransaction(transaction);

        return this.responseSuccess('Successfully added new transactions');
    }
}
