import { IsIn } from 'class-validator';

// PROPOSED is the server-set initial state, not a value a client can respond
// with — restrict this DTO to the two responses a cooperative member can
// actually make, rather than IsEnum(RentToOwnStatus)'s full enum.
export class RespondRentToOwnMatchDto {
  @IsIn(['ACCEPTED', 'DECLINED'])
  status!: 'ACCEPTED' | 'DECLINED';
}
