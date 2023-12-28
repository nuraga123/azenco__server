import { Controller, Get } from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { Body, Param, Post, Query } from '@nestjs/common/decorators';
import { BoilerPartsService } from './boiler-parts.service';
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
  //
  // @Get()
  // paginateAndFilter(@Query() query: IBoilerPartsQuery) {
  //   return this.boilerPartsService.paginateAndFilter(query);
  // }

  @ApiOkResponse({ type: FindOneResponse })
  @Get('find/:id')
  getOne(@Param('id') id: string) {
    return this.boilerPartsService.findOne(id);
  }

  @ApiOkResponse({ type: GetBestsellersResponse })
  @Get('bestsellers')
  getBestseller() {
    return this.boilerPartsService.bestsellers();
  }

  @ApiOkResponse({ type: GetNewResponse })
  @Get('new')
  getNew() {
    return this.boilerPartsService.new();
  }

  @ApiOkResponse({ type: SearchResponse })
  @ApiBody({ type: SearchRequest })
  @Post('search')
  search(@Body() { search }: { search: string }) {
    return this.boilerPartsService.searchByString(search);
  }

  @ApiOkResponse({ type: GetByNameResponse })
  @ApiBody({ type: GetByNameRequest })
  @Post('name')
  getByName(@Body() { name }: { name: string }) {
    return this.boilerPartsService.findOneByName(name);
  }

  @ApiOkResponse({ type: PaginateAndFilterResponse })
  @Get()
  paginateAndFilterOrSort(@Query() query: IBoilerPartsQuery) {
    return this.boilerPartsService.paginateAndFilterOrSort(query);
  }
}
