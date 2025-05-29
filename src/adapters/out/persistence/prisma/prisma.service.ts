import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      console.warn(
        '⚠️  PrismaService: DATABASE_URL not found, skipping connection',
      );
      return;
    }

    try {
      await this.$connect();
      console.log('✅ PrismaService connected to database');
    } catch (error) {
      console.error('❌ PrismaService connection failed:', error.message);
    }
  }

  enableShutdownHooks(app: INestApplication) {
    if (process.env.DATABASE_URL) {
      (this as any).$on('beforeExit', async () => {
        await app.close();
      });
    }
  }
}
