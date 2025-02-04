import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller("/api")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/hello")
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/say-goodby")
  getGoodBy(): string {
    return "Good By!";
  }

  @Get("/say-goodby-2")
  getGoodBy(): string {
    return "Good By!";
  }

}
