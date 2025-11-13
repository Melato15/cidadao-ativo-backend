import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { VotesModule } from './votes/votes.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { CommunityProposalsModule } from './community-proposals/community-proposals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jawsDbUrl = configService.get('JAWSDB_URL');
        
        console.log('=== Database Configuration ===');
        console.log('JAWSDB_URL:', jawsDbUrl ? 'Found' : 'Not found');
        console.log('process.env.JAWSDB_URL:', process.env.JAWSDB_URL ? 'Found' : 'Not found');

        if (jawsDbUrl) {
          // Parse JawsDB URL for Heroku production
          const url = new URL(jawsDbUrl);
          console.log('Using JawsDB MySQL - Host:', url.hostname);
          return {
            type: 'mysql' as const,
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            username: url.username,
            password: url.password,
            database: url.pathname.substring(1), // Remove leading '/'
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false, // Never use synchronize in production
            charset: 'utf8mb4',
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }

        // Local development configuration
        console.log('Using local MySQL configuration');
        return {
          type: 'mysql' as const,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE', 'test'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') === 'development',
          charset: 'utf8mb4',
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    ProjectsModule,
    VotesModule,
    AuthModule,
    ReportsModule,
    CommunityProposalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
