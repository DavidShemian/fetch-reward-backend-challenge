import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export default class SpendPointsDTO {
    @ApiProperty()
    @IsInt()
    @IsPositive()
    public points!: number;
}
