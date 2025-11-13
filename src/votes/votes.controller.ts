import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { AuthGuard } from '../auth/auth.guard';
import { VoteType } from './entities/vote.entity';

class VoteDto {
  type: 'up' | 'down';
  comment?: string;
}

@ApiTags('votes')
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post('project/:projectId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Votar em um projeto' })
  @ApiParam({ name: 'projectId', description: 'ID do projeto' })
  async vote(
    @Param('projectId') projectId: string,
    @Body() voteDto: VoteDto,
    @Request() req: any,
  ) {
    const voteType = voteDto.type === 'up' ? VoteType.UP : VoteType.DOWN;
    return this.votesService.vote(
      req.user.sub,
      projectId,
      voteType,
      voteDto.comment,
    );
  }

  @Delete('project/:projectId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover voto de um projeto' })
  @ApiParam({ name: 'projectId', description: 'ID do projeto' })
  async removeVote(@Param('projectId') projectId: string, @Request() req: any) {
    await this.votesService.removeVote(req.user.sub, projectId);
    return { message: 'Voto removido com sucesso' };
  }

  @Get('project/:projectId/my-vote')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar meu voto em um projeto' })
  @ApiParam({ name: 'projectId', description: 'ID do projeto' })
  async getMyVote(@Param('projectId') projectId: string, @Request() req: any) {
    return this.votesService.getUserVote(req.user.sub, projectId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Listar todos os votos de um projeto' })
  @ApiParam({ name: 'projectId', description: 'ID do projeto' })
  async getProjectVotes(@Param('projectId') projectId: string) {
    return this.votesService.getProjectVotes(projectId);
  }

  @Get('my-votes')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar meus votos' })
  async getMyVotes(@Request() req: any) {
    return this.votesService.getUserVotes(req.user.sub);
  }
}
