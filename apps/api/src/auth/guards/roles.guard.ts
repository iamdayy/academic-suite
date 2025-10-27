import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role as RoleOnDB, User } from '@prisma/client';
import { Role } from 'shared-types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Dapatkan peran apa yang "dibutuhkan" oleh endpoint ini
    //    (dari decorator @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika tidak ada decorator @Roles, izinkan akses (publik)
    if (!requiredRoles) {
      return true;
    }

    // 2. Dapatkan data user yang sedang login (dari JwtStrategy)
    const { user } = context
      .switchToHttp()
      .getRequest<{ user: User & { role: RoleOnDB } }>();

    // 3. Bandingkan peran user dengan peran yang dibutuhkan
    //    Cek apakah 'user.role.roleName' ada di dalam array 'requiredRoles'
    return requiredRoles.some((role) => user.role?.roleName === role);
  }
}
