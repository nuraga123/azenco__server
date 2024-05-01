import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BarnService } from '../service/barn.service';
import { CreatedBarnDto } from '../dto/create-barn.dto';

@Controller('barn')
export class BarnController {
  constructor(private readonly barnService: BarnService) {}

  // получение имен анбаров  @Post('usernames')
  getAnbarsUsernames(@Body('name') name: string) {
    return this.barnService.getAnbarsUsernames(name);
  }

  // все анбары
  @Get('all')
  getAnbars() {
    return this.barnService.findAll();
  }

  // поиск по id анбара
  @Get(':id')
  async getFindOneAnbarProduct(@Param('id') anbarId: number) {
    return await this.barnService.findOneAnbarId(anbarId);
  }

  // поиск по userId
  @Get('user/:id')
  async getAnbarByUserId(@Param('id') userId: number) {
    return await this.barnService.findAllByUserId(userId);
  }

  // новый анбар
  @Post('create')
  postCreateNewAnbar(@Body() createdBarnDto: CreatedBarnDto) {
    return this.barnService.createNewAnbar(createdBarnDto);
  }
}
export { BarnService };
