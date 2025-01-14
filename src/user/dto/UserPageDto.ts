import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class PageDto {

  @IsNotEmpty()
  @IsNumber()
  page!: number;

  @IsNotEmpty()
  @IsNumber()
  limit!: number;

  text!: string;
}

export class ResponsePageableDto<T> {
  items: T[] = [];
  total:number = 0;
  page:number = 0;
  limit:number = 0;
  totalPages: number = 0;

}