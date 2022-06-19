import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async signup(dto: AuthDto) {
    // generate the password
    const hash = await argon.hash(dto.password);
    // save the new user in the db and return it
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
      });
      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');
    const pwdMatches = await argon.verify(user.password, dto.password);
    if (!pwdMatches) throw new ForbiddenException('Credentials incorrect');
    delete user.password;
    return user;
  }
}
