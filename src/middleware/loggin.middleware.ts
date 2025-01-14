import { NestMiddleware, Logger, Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';


@Injectable()
export class LoggingMiddleware implements NestMiddleware {

   logger = new Logger("Response");
  constructor() {
  }

  use(req: Request, res: Response, next: NextFunction): any {

    const { method, originalUrl: url} = req;
    const reqTime = new Date().getTime();

    res.on("finish",() => {
      const {statusCode} = res;
      const resTime = new Date().getTime();
      if  (statusCode === 200 || statusCode === 201 ) {
        this.logger.log( `${method} ${url} ${statusCode}  -${resTime-reqTime}` );
      }
    } );

    next();


  }


}