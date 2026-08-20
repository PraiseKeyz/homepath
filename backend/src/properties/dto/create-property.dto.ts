import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PropertyListingType } from '../../../generated/prisma/index.js';

export class CreatePropertyDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PropertyListingType)
  listingType!: PropertyListingType;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  bedrooms!: number;

  @IsString()
  address!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsString()
  areaKey!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImages?: string[];
}
