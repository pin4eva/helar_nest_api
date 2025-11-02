import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateUserDTO } from "./user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async getUsers() {
		return this.userService.getUsers();
	}

	@Post()
	async createUser(@Body() input: CreateUserDTO) {
		return this.userService.createUser(input);
	}
}
