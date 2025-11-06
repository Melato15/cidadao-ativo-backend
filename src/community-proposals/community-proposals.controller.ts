import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunityProposalsService } from './community-proposals.service';
import { CreateCommunityProposalDto } from './dto/create-community-proposal.dto';
import { UpdateCommunityProposalDto } from './dto/update-community-proposal.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('community-proposals')
@Controller('community-proposals')
export class CommunityProposalsController {
  constructor(
    private readonly communityProposalsService: CommunityProposalsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new community proposal' })
  create(@Body() createDto: CreateCommunityProposalDto, @Request() req: any) {
    return this.communityProposalsService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all community proposals' })
  findAll() {
    return this.communityProposalsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a community proposal by ID' })
  findOne(@Param('id') id: string) {
    return this.communityProposalsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a community proposal' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCommunityProposalDto,
    @Request() req: any,
  ) {
    return this.communityProposalsService.update(+id, updateDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a community proposal' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.communityProposalsService.remove(+id, req.user.sub);
  }
}
