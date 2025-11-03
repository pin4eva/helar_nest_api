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
  GetUsersFilterInput,
  UpdateProfileTypeDTO,
  UpdateStatusDTO,
  UpdateUserDTO,
  UpdateUserRoleDTO,
  UploadImageDTO,
} from './user.dto';
import { UserService } from './user.service';

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

  @Patch('update-role')
  async updateUserRole(@Body() input: UpdateUserRoleDTO) {
    return this.userService.updateRole(input);
  }

  @Patch('update-status')
  async updateUserStatus(@Body() input: UpdateStatusDTO) {
    return this.userService.updateStatus(input);
  }

  @Patch('update-profile-type')
  async updateUserProfileType(@Body() input: UpdateProfileTypeDTO) {
    return this.userService.updateProfileType(input);
  }

  @Patch('upload-image')
  async uploadProfileImage(@Body() input: UploadImageDTO) {
    return this.userService.uploadProfileImage(input);
  }
}
