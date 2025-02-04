import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller("/api")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/hello")
  getHello(): string {
    return this.appService.getHello();
  }

   @Get("/say-goodby-3")
  getGoodBy(): string {
    return "Good By3!";
  }

  @Get("/say-goodby-2")
  getGoodBy(): string {
    return "Good By!";
  }

  @Get("/say-hi")
  getHello(): string {
    return "Hi";
  }

}
