import { ApiProperty } from '@nestjs/swagger';

export default class SpentReport {
    @ApiProperty()
    public payer: string;

    @ApiProperty()
    public points: number;

    constructor(payer: string, points: number) {
        this.payer = payer;
        this.points = points;
    }
}
