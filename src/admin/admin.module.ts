import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [UserService],
})
export class AdminModule {}
