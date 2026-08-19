import { IsNumber, Min } from 'class-validator';

export class JoinCooperativeDto {
  @IsNumber()
  @Min(5000)
  monthlyContributionAmount!: number;
}
