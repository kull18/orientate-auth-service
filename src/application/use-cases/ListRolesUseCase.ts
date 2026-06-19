import { ListRolesUseCasePort, RoleDTO } from '../ports/inputs/AuthUseCasesPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';

export class ListRolesUseCase implements ListRolesUseCasePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(): Promise<RoleDTO[]> {
    const roles = await this.userRepository.findAllRoles();
    return roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
    }));
  }
}
