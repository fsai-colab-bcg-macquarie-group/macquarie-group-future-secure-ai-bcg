import { Module, Scope } from '@nestjs/common'

import { JwtModule } from '@nestjs/jwt'
import { env } from 'process'
import { AccessHierarchyController } from './controllers/auth-layer/access/access-controller'
import { AuthController } from './controllers/auth-layer/auth/auth-controller'
import { UseCaseTeamController } from './controllers/auth-layer/use-case-team/use-case-team-controller'
import { UsersController } from './controllers/auth-layer/user/user-controller'
import { WorkerController } from './controllers/head-agent/worker-controller'
import { UseCaseTeamRepository } from './repository/auth-layer/use-case-team/use-case-team-repository'
import { UsersRepository } from './repository/auth-layer/user/user-repository'
import { BaseDataManager } from './repository/base/base-data-manager'
import { WorkerRepository } from './repository/head-agent/worker/worker-repository'
import { AccessHierarchyService } from './services/auth-layer/access/access-service'
import { AuthenticationService } from './services/auth-layer/auth/authentication-service'
import { UseCaseTeamService } from './services/auth-layer/use-case-team/use-case-team-service'

import { AccessHierarchyPermissionController } from './controllers/auth-layer/access-permission/access-permission-controller'
import { DirectoryUserController } from './controllers/auth-layer/directory-user/directory-user-controller'
import { LogController } from './controllers/logger/log-controller'
import { AccessHierarchyPermissionRepository } from './repository/auth-layer/access-permission/access-permission-repository'
import { AccessHierarchyRepository } from './repository/auth-layer/access/access-repository'
import { AuthenticationRepository } from './repository/auth-layer/auth/authentication-repository'
import { LogAuthenticationRepository } from './repository/logger/auth-layer/auth/log-authentication-repository'
import { AccessHierarchyPermissionService } from './services/auth-layer/access-permission/access-permission-service'
import { LoginHandleService } from './services/auth-layer/auth/login-handle-service'
import ActiveDirectoryUserService from './services/auth-layer/directory-user/directory-user-service'
import { UserService } from './services/auth-layer/user/user-service'
import { WorkerService } from './services/head-agent/worker-service'
import { LogAuthenticationService } from './services/logger/auth-layer/log-authentication-service'
import { MailProvider } from './shared/providers/mail-provider'
import { HttpClientService } from './shared/services/http-service/http-client-service'
import { EmailNotificationService } from './shared/services/notification/email-notification-service'
import { TemplateService } from './shared/services/notification/template-service'
import { WorldStateCitiesRepository } from './repository/auth-layer/world-state-cities/world-state-cities-repository'
import { WorldStateCitiesController } from './controllers/auth-layer/world-state-cities/world-state-cities-controller'
import { WorldStateCitiesService } from './services/auth-layer/world-state-cities/world-state-cities-service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { authLayerMigrations } from './database/migrations'
import { AuthenticatedToken } from './middleware/authenticated-token'
import { UpsertUserFactory } from './services/auth-layer/user/factory-upsert-user'
import { LoggerModule } from 'nestjs-pino'
import { CustomLoggerModule } from './logger/custom-logger.module'
import { LoggerService } from './logger/logger.service'
import { createLoggerOptions } from './logger/logger.config'
import { HistoryService } from './services/auth-layer/history/history-service'
import { HistoryRepository } from './repository/auth-layer/history/history-repository'

@Module({
    imports: [
        LoggerModule.forRootAsync({
            useFactory: createLoggerOptions(),
        }),
        CustomLoggerModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: env.DB_HOST,
            port: parseInt(env.DB_PORT || '5432'),
            username: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
            synchronize: false,
            migrationsRun: false,
            autoLoadEntities: false,
            migrations: authLayerMigrations,
            migrationsTableName: 'public.auth_layer_migrations',
        }),
        JwtModule.register({
            global: true,
            secret: env.JWT_SECRET,
        }),
    ],
    controllers: [
        AuthController,
        UsersController,
        UseCaseTeamController,
        AccessHierarchyController,
        WorkerController,
        AccessHierarchyController,
        AccessHierarchyPermissionController,
        LogController,
        DirectoryUserController,
        WorldStateCitiesController,
    ],
    providers: [
        {
            provide: 'IAuthenticationService',
            useClass: AuthenticationService,
        },
        {
            provide: 'IWorldStateCitiesService',
            useClass: WorldStateCitiesService,
        },
        {
            provide: 'ILogAuthenticationService',
            useClass: LogAuthenticationService,
        },
        {
            provide: 'ILogAuthenticationRepository',
            useClass: LogAuthenticationRepository,
        },
        {
            provide: 'IUserService',
            useClass: UserService,
        },
        {
            provide: 'IUseCaseTeamService',
            useClass: UseCaseTeamService,
        },
        {
            provide: 'IAccessHierarchyService',
            useClass: AccessHierarchyService,
        },
        {
            provide: 'IAccessHierarchyPermissionService',
            useClass: AccessHierarchyPermissionService,
        },
        {
            provide: 'IWorkerService',
            useClass: WorkerService,
        },
        {
            provide: 'IUsersRepository',
            useClass: UsersRepository,
        },
        {
            provide: 'TOKEN_VALUE',
            inject: [AuthenticatedToken],
            useFactory: (clientToken: AuthenticatedToken) =>
                clientToken.getToken(),
            scope: Scope.REQUEST,
        },
        {
            provide: 'ILoggerService',
            useClass: LoggerService,
        },
        {
            provide: 'IBaseDataManager',
            inject: [LoggerService, 'TOKEN_VALUE'],
            useFactory: (loggerService: LoggerService, token: string) =>
                new BaseDataManager(loggerService, token),
            scope: Scope.REQUEST,
        },

        {
            provide: 'IUseCaseTeamRepository',
            useClass: UseCaseTeamRepository,
        },
        {
            provide: 'IWorkerRepository',
            useClass: WorkerRepository,
        },
        {
            provide: 'IAccessHierarchyRepository',
            useClass: AccessHierarchyRepository,
        },
        {
            provide: 'IAccessHierarchyPermissionRepository',
            useClass: AccessHierarchyPermissionRepository,
        },
        {
            provide: 'IEMailNotificationService',
            useClass: EmailNotificationService,
        },
        {
            provide: 'ISupabaseService',
            useClass: AuthenticationRepository,
        },
        {
            provide: 'IMailProvider',
            useClass: MailProvider,
        },
        {
            provide: 'ITemplateService',
            useClass: TemplateService,
        },
        {
            provide: 'IAuthenticationRepository',
            useClass: AuthenticationRepository,
        },
        {
            provide: 'IDirectoryUserService',
            useClass: ActiveDirectoryUserService,
        },
        {
            provide: 'IHttpClientService',
            useClass: HttpClientService,
        },
        {
            provide: 'IWorldStateCitiesRepository',
            useClass: WorldStateCitiesRepository,
        },
        {
            provide: 'IHistoryService',
            useClass: HistoryService,
        },
        {
            provide: 'IHistoryRepository',
            useClass: HistoryRepository,
        },
        LoggerService,
        AuthenticationRepository,
        UserService,
        LoginHandleService,
        AuthenticatedToken,
        UpsertUserFactory,
    ],
    exports: ['IAuthenticationService'],
})
export class AppModule {}
