import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PageDto {
  @ApiProperty({ example: '1', description: 'Page number' })
  @IsNotEmpty()
  @IsNumber()
  page!: number;

  @ApiProperty({ example: '20', description: 'Limiting the number of records on the page.' })
  @IsNotEmpty()
  @IsNumber()
  limit!: number;

  @ApiPropertyOptional({ example: 'Word1 Word2 Word3', description: 'Searcing words' })
  text!: string;
}

export class ResponsePageableDto<T> {
  @ApiProperty({ example: '[ item_1, item_2, item_3 ]', description: 'Items' })
  items: T[] = [];

  @ApiProperty({ example: '100', description: 'Total records' })
  total: number = 0;

  @ApiProperty({ example: '5', description: 'Page number' })
  page: number = 0;

  @ApiProperty({ example: '100', description: 'Limiting the number of records' })
  limit: number = 0;

  @ApiProperty({ example: '99', description: 'Total pages' })
  totalPages: number = 0;
}
