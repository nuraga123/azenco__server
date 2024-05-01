import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BarnService } from '../service/barn.service';
import { CreatedBarnDto } from '../dto/create-barn.dto';

@Controller('barn')
export class BarnController {
  constructor(private readonly barnService: BarnService) {}

  // получение имен анбаров  @Post('usernames')
  getBarnsUsername(@Body('noname') noname: string) {
    return this.barnService.findAllBarnsUsername(noname);
  }

  // все анбары
  @Get('all')
  getBarns() {
    return this.barnService.findAllBarns();
  }

  // поиск по id анбара
  @Get(':id')
  async getBarnId(@Param('id') anbarId: number) {
    return await this.barnService.findOneBarnId(anbarId);
  }

  // поиск по userId
  @Get('user/:id')
  async getBarnsUserId(@Param('id') userId: number) {
    return await this.barnService.findAllBarnsUserId(userId);
  }

  // новый анбар
  @Post('create')
  postCreateBarn(@Body() createdBarnDto: CreatedBarnDto) {
    return this.barnService.createBarn(createdBarnDto);
  }
}
export { BarnService };
