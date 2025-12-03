import { SetMetadata } from '@nestjs/common';
import { UserPermissionEnum } from '../user/user-permission';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: UserPermissionEnum[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
