import { ArgumentMetadata, Injectable, PipeTransform, ExecutionContext, BadRequestException } from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as console from 'node:console';
import { ValidationException } from '../exceptions/validation.exception';
import { ValidationPipeOptions } from '@nestjs/common/pipes/validation.pipe';



@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {

    console.log("value__", value);
    const {  metatype, data  } = metadata;
    console.log("ValidationPipe metadata", metadata);

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
        let messages = errors.map(err => {
            if ( err.constraints ) {
              return `[${err.property}] - ${Object.values(err.constraints).join(', ')}`
            }

          });
      throw new ValidationException('Validation failed: '+messages);
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}


function getAllError(obj: object) {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      getAllError(value);
    } else {
      console.log(`${key}: ${value}`);
    }
  });
}









