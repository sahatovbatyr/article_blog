import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import console from 'node:console';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ReqParamParseIntPipe implements PipeTransform<string, number> {


  transform(value: string, metadata: ArgumentMetadata): number {
    const { data } = metadata;
    const parsedValue = parseInt(value);

    if (isNaN(parsedValue) || parsedValue.toString()!= value) {
      throw new ValidationException(`Validation failed: Request Param ${data} is NOT Number.It's ${value}`);
    }

    return parsedValue;
  }
}

