import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  root() {
    return { message: 'Store Backend API', status: 'running', version: 'v1' };
  }
}
