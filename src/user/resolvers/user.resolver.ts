import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetUsersFilterInput, UpdateUserDTO } from '../dto/user.dto';
import { User } from '../schema/user.schema';
import { UserService } from '../services/user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async getUsers(
    @Args('input', { nullable: true }) input?: GetUsersFilterInput,
  ) {
    return this.userService.getUsers(input);
  }

  @Query(() => User, { nullable: true })
  async getUser(@Args('id', { type: () => ID }) id: string) {
    return this.userService.getUserById(id);
  }

  @Mutation(() => String)
  async updateUser(@Args('input') input: UpdateUserDTO) {
    return this.userService.updateUser(input);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => ID }) id: string) {
    return this.userService.deleteUser(id);
  }
}
