import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory{
    @Inject(ConfigService)
    private readonly configService: ConfigService;

    public createTypeOrmOptions(): TypeOrmModuleOptions{
        return {
            autoLoadEntities: true,
            type: "postgres",
            host: process.env.DATABASE_HOST,
            port: 5432,
            database: process.env.DATABASE_NAME,
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            entities: ['dist/**/*.entity.{ts,js}'],
            migrations: ['dist/migrations/*.{ts,js}'],
            migrationsTableName: 'typeorm_migrations',
            logger: 'file',
            synchronize: !!process.env.DATABASE_SYNCHRONIZE,
           
        };
    }
}