import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Mock class for when DATABASE_URL is not available
class MockPrismaService {
  onModuleInit() {
    console.log('🔄 MockPrismaService initialized (no database)');
  }

  enableShutdownHooks() {
    // No-op for mock
  }
}

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: () => {
        if (!process.env.DATABASE_URL) {
          console.warn('⚠️  DATABASE_URL not found, using MockPrismaService');
          return new MockPrismaService();
        }
        return new PrismaService();
      },
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
