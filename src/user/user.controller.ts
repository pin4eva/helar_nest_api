import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import {
  AssignPermissionsDTO,
  GetUsersFilterInput,
  UpdateProfileTypeDTO,
  UpdateStatusDTO,
  UpdateUserDTO,
  UpdateUserRoleDTO,
  UploadImageDTO,
} from './user.dto';
import { UserService } from './user.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/generated/enums';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query() query?: GetUsersFilterInput) {
    return this.userService.getUsers(query);
  }

  @Get('single/:id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put('update')
  async updateUser(@Body() input: UpdateUserDTO) {
    return this.userService.updateUser(input);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Developer)
  @Patch('update-role')
  async updateUserRole(@Body() input: UpdateUserRoleDTO) {
    return this.userService.updateRole(input);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Developer)
  @Patch('update-status')
  async updateUserStatus(@Body() input: UpdateStatusDTO) {
    return this.userService.updateStatus(input);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Developer)
  @Patch('update-profile-type')
  async updateUserProfileType(@Body() input: UpdateProfileTypeDTO) {
    return this.userService.updateProfileType(input);
  }

  @Patch('upload-image')
  async uploadProfileImage(@Body() input: UploadImageDTO) {
    return this.userService.uploadProfileImage(input);
  }

  @Patch('assign-permissions')
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Developer)
  async assignPermissions(@Body() input: AssignPermissionsDTO) {
    return this.userService.assignPermissions(input);
  }
}
