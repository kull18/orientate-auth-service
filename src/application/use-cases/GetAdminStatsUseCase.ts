import { GetAdminStatsUseCasePort, UserMetricsDTO } from '../ports/inputs/AuthUseCasesPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';

export class GetAdminStatsUseCase implements GetAdminStatsUseCasePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(): Promise<UserMetricsDTO> {
    return await this.userRepository.getUserMetrics();
  }
}
