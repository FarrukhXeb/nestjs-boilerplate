import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UserService } from '../user/user.service';
import { AdminGuard } from './guard';

@Controller('admin')
@UseGuards(JwtGuard, AdminGuard)
export class AdminController {
  constructor(private userService: UserService) {}
  @Get('/users')
  getAllUser() {
    return this.userService.getAllUsers();
  }
}
