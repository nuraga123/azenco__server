import { Controller, Get } from '@nestjs/common';
import { BoilerPartsService } from './boiler-parts.service';
import { Body, Param, Post, Query, UseGuards } from '@nestjs/common/decorators';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import {
  FindOneResponse,
  GetBestsellersResponse,
  GetByNameRequest,
  GetByNameResponse,
  GetNewResponse,
  IBoilerPartsQuery,
  PaginateAndFilterResponse,
  SearchRequest,
  SearchResponse,
} from './types';

@Controller('boiler-parts')
export class BoilerPartsController {
  constructor(private readonly boilerPartsService: BoilerPartsService) {}

  // @ApiOkResponse({ type: PaginateAndFilterResponse })
  // @UseGuards(AuthenticatedGuard)
  // @Get()
  // paginateAndFilter(@Query() query: IBoilerPartsQuery) {
  //   return this.boilerPartsService.paginateAndFilter(query);
  // }

  @ApiOkResponse({ type: FindOneResponse })
  @UseGuards(AuthenticatedGuard)
  @Get('find/:id')
  getOne(@Param('id') id: string) {
    return this.boilerPartsService.findOne(id);
  }

  @ApiOkResponse({ type: GetBestsellersResponse })
  @UseGuards(AuthenticatedGuard)
  @Get('bestsellers')
  getBestseller() {
    return this.boilerPartsService.bestsellers();
  }

  @ApiOkResponse({ type: GetNewResponse })
  @UseGuards(AuthenticatedGuard)
  @Get('new')
  getNew() {
    return this.boilerPartsService.new();
  }

  @ApiOkResponse({ type: SearchResponse })
  @ApiBody({ type: SearchRequest })
  @UseGuards(AuthenticatedGuard)
  @Post('search')
  search(@Body() { search }: { search: string }) {
    return this.boilerPartsService.searchByString(search);
  }

  @ApiOkResponse({ type: GetByNameResponse })
  @ApiBody({ type: GetByNameRequest })
  @UseGuards(AuthenticatedGuard)
  @Post('name')
  getByName(@Body() { name }: { name: string }) {
    return this.boilerPartsService.findOneByName(name);
  }

  @ApiOkResponse({ type: PaginateAndFilterResponse })
  @UseGuards(AuthenticatedGuard)
  @Get()
  paginateAndFilterOrSort(
    @Query() query: IBoilerPartsQuery,
    @Query('sortBy') sortBy: string,
  ) {
    const ascending = sortBy && sortBy.toLowerCase() === 'asc';
    return this.boilerPartsService.paginateAndFilterOrSort(query, ascending);
  }
}
