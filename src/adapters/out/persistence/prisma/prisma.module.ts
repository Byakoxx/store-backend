import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: () => {
        try {
          if (!process.env.DATABASE_URL) {
            console.warn(
              '⚠️  DATABASE_URL not found, using mock PrismaService',
            );
            return null; // Return null if no DATABASE_URL
          }
          return new PrismaService();
        } catch (error) {
          console.warn(
            '⚠️  PrismaService initialization failed:',
            error.message,
          );
          return null;
        }
      },
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
