import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
  async getAllUsers() {
    return this.prismaService.user.findMany({
      include: {
        bookmarks: true,
      },
    });
  }
  async getUserWithBookmarks(id: number) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        bookmarks: true,
      },
    });
  }
  async editUser(id: number, dto: EditUserDto) {
    const user = await this.prismaService.user.update({
      where: { id },
      data: { ...dto },
    });
    delete user.password;
    return user;
  }
}
