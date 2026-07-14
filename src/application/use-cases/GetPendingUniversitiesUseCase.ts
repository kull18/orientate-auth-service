import { GetPendingUniversitiesUseCasePort, PendingUniversityDTO } from '../ports/inputs/AuthUseCasesPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';

export class GetPendingUniversitiesUseCase implements GetPendingUniversitiesUseCasePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(): Promise<PendingUniversityDTO[]> {
    const pendingUsers = await this.userRepository.findPendingUniversities();
    return pendingUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      universityName: user.universityName || '',
      claimedCct: user.claimedCct || '',
      rfc: user.rfc || '',
      registeredAt: user.createdAt,
    }));
  }
}
