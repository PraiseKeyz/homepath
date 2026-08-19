import { IsOptional, IsString } from 'class-validator';

// Fields are self-attested by the user reading their own document — never
// parsed by AI. See docs/ARCHITECTURE.md §2 "pure self-attestation".
export class SubmitDocumentDto {
  @IsString()
  plotNumber!: string;

  @IsString()
  surveyNumber!: string;

  @IsString()
  attestedOwnerName!: string;

  @IsString()
  documentType!: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
