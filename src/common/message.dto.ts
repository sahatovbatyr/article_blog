import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ example: 'Success message', description: 'Message ' })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
