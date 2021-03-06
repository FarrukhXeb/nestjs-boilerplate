import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('/me/bookmarks')
  getUserBookmarks(@GetUser('id') id: number) {
    return this.userService.getUserWithBookmarks(id);
  }

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser(@GetUser('id') id: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(id, dto);
  }
}
