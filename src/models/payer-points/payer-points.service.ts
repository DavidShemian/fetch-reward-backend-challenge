import { Injectable, BadRequestException } from '@nestjs/common';
import BaseService from '../../bases/service.base';
import PayerPointsEntity from './entities/payers-points.entity';
import PayerPointsDAL from './payer-points.dal';
import PayerEntity from '../payer/entities/payers.entity';
import PayerPointsBalance from './types/payer-points-balance.class';
import SpentReport from './types/spent-report.class';

@Injectable()
export default class PayerPointsService extends BaseService {
    constructor(private readonly payerPointsDal: PayerPointsDAL) {
        super();
    }

    public async createPayerPoints(payer: PayerEntity, points: number, timestamp: string): Promise<PayerPointsEntity> {
        return this.payerPointsDal.createPayerPoints(new PayerPointsEntity(payer, points, timestamp));
    }

    public async getPayerPointsUntilDate(id: string, to: string): Promise<PayerPointsEntity[]> {
        return this.payerPointsDal.getPayerPointsUntilDate(id, to);
    }

    public async getPayersPointsBalance(): Promise<PayerPointsBalance> {
        const pointsBalance = await this.payerPointsDal.getPayersPointsBalance();

        return pointsBalance.reduce((balance, { payer, points }) => {
            balance[payer] = points;

            return balance;
        }, {} as PayerPointsBalance);
    }

    /**
     * This function takes care of reducing the points in case current transactions is negative.
     * It iterates over the history of the transaction payer points balance, from oldest to transaction data, and reduce the points from each entry,
     * as long as there are points left to reduce.
     * Use will loop and not build in array function (map, reduce, etc) because we might want to break during the loop
     * @param pointsToReduce - Number of points to reduce from payer points
     * @param payerName - The payer name
     * @returns the updated payerPoints
     */
    public async reducePointsFromPayerPoints(pointsToReduce: number, payerID: string, transactionTimestamp: string): Promise<PayerPointsEntity[]> {
        const payerPoints = await this.getPayerPointsUntilDate(payerID, transactionTimestamp);
        const updatedPayerPoints: PayerPointsEntity[] = [];

        while (pointsToReduce < 0) {
            const oldestPayerPoint = payerPoints.shift();

            if (!oldestPayerPoint) break;

            // The current transaction cover the reduction
            // Need to reduce pointsToReduce (by adding it since it is negative) from payerPoints and reset it
            if (pointsToReduce * -1 <= oldestPayerPoint.points) {
                oldestPayerPoint.points += pointsToReduce;
                pointsToReduce = 0;
            } else {
                // Need to add payerPoints to pointsToReduce and to reset payerPoints
                pointsToReduce += oldestPayerPoint.points;
                oldestPayerPoint.points = 0;
            }

            updatedPayerPoints.push(oldestPayerPoint);
        }

        // There are still points left to reduce
        // Cancel the spending
        if (pointsToReduce < 0) {
            throw new BadRequestException('Unable to process transaction, payer points will be negative');
        }

        return this.updatePayerPoints(updatedPayerPoints);
    }

    /**
     * This function takes care of spending the points.
     * It iterates over the history of the all payers points balance, from oldest to newest, and reduce the points from each entry,
     * as long as there are points left to reduce.
     * Use will loop and not build in array function (map, reduce, etc) because we might want to break during the loop
     * @param pointsToReduce - Number of points to reduce from payer points
     * @param payerName - The payer name
     * @returns the updated payerPoints
     */
    public async spendPoints(pointsToSpend: number): Promise<SpentReport[]> {
        const transactionsOrderedByTimestamps = await this.payerPointsDal.getAllPayerPointsSortedByTimestamp();
        const updatedPayerPoints = [];
        const pointsDelta: Record<string, number> = {};

        while (pointsToSpend > 0) {
            const oldestPayerPoints = transactionsOrderedByTimestamps.shift();

            // No more payerPoints left
            if (!oldestPayerPoints) break;

            const { name } = oldestPayerPoints.payer;

            // The current payerPoints cover the spending
            // Need to reduce pointsToSpend from payerPoints and reset it
            if (oldestPayerPoints.points > pointsToSpend) {
                pointsDelta[name] = pointsDelta[name] ? pointsDelta[name] - pointsToSpend : -pointsToSpend;
                oldestPayerPoints.points = oldestPayerPoints.points - pointsToSpend;
                pointsToSpend = 0;
            } else {
                // Need to reduce payerPoints from pointsToSpend and to reset payerPoints
                pointsToSpend -= oldestPayerPoints.points;
                pointsDelta[name] = pointsDelta[name] ? pointsDelta[name] - oldestPayerPoints.points : -oldestPayerPoints.points;
                oldestPayerPoints.points = 0;
            }

            updatedPayerPoints.push(oldestPayerPoints);
        }

        // There are still points left to spend
        // Cancel the spending
        if (pointsToSpend > 0) {
            throw new BadRequestException('Points to spend is bigger than total balance');
        }

        await this.updatePayerPoints(updatedPayerPoints);

        return this.getSpentReport(pointsDelta);
    }

    private getSpentReport(pointsDelta: Record<string, number>): SpentReport[] {
        return Object.keys(pointsDelta).reduce((result, name) => {
            result.push(new SpentReport(name, pointsDelta[name]));

            return result;
        }, [] as SpentReport[]);
    }

    private async updatePayerPoints(payerPoints: PayerPointsEntity[]): Promise<PayerPointsEntity[]> {
        return this.payerPointsDal.updatePayerPoints(payerPoints);
    }
}
