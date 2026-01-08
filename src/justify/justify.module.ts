import { Module } from '@nestjs/common';
import { JustifyController } from './justify.controller';
import { JustifyService } from './justify.service';

@Module({
    controllers: [JustifyController],
    providers: [JustifyService],
    exports: [JustifyService],
})
export class JustifyModule { }