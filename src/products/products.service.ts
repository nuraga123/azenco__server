/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';

import { Product } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import {
  IAddAndUpdateProduct,
  IProductResponse,
  ICountAndRowsProductsResponse,
  IProductsFilter,
  IProductsQuery,
  IProductsResponse,
  IValidateProduct,
  IDeleteProduct,
  IUpdateProduct,
} from './types';
import { ErrorService } from 'src/errors/errors.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    private readonly errorsService: ErrorService,
  ) {
    /**/
  }

  // Метод для обработки цены продукта
  async processProductPrice(product: Product): Promise<{ product: Product }> {
    if (product && product?.price) product.price = +product.price;
    return { product };
  }

  // Метод для поиска продукта по его идентификатору
  async findOneProduct(id: number): Promise<IProductResponse> {
    try {
      const product = await this.productModel.findByPk(id);
      if (!product) return { error_message: `Продукт с ID ${id} не найден` };
      return this.processProductPrice(product);
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для поиска всех продуктов
  async findProducts(): Promise<IProductsResponse> {
    try {
      const products = await this.productModel.findAll();
      if (!products.length) return { error_message: `Продукты не найдены` };
      return { products };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для поиска продукта по его имени
  async findByNameProduct(name: string): Promise<IProductResponse> {
    try {
      const product = await this.productModel.findOne({ where: { name } });
      if (!product)
        return { error_message: `Продукт с именем ${name} не найден` };
      return this.processProductPrice(product);
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для поиска продукта по его коду Azenco
  async findByAzencoCodeProduct(azencoCode: string): Promise<IProductResponse> {
    try {
      const product = await this.productModel.findOne({
        where: { azencoCode },
      });

      if (!product) {
        return {
          error_message: `Продукт с кодом Azenco ${azencoCode} не найден`,
        };
      }

      return this.processProductPrice(product);
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для поиска продуктов по их типу
  async findByTypeProducts(type: string): Promise<IProductsResponse> {
    try {
      const products = await this.productModel.findAll({ where: { type } });

      if (!products?.length) {
        return { error_message: `Продукт с type ${type} не найден` };
      }

      products.forEach(this.processProductPrice);
      return { products };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для поиска продуктов по части имени
  async findAllPartByNameProducts(
    part_name: string,
  ): Promise<IProductsResponse> {
    try {
      const products = await this.productModel.findAll({
        where: {
          name: { [Op.like]: `%${part_name}%` },
        },
      });

      if (!products.length)
        return { error_message: `не существует ${part_name} ` };

      products.forEach(this.processProductPrice);
      return { products };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для валидации данных нового продукта
  async validateProduct({ productDto }: IValidateProduct): Promise<string> {
    const { name, azencoCode, price, type, unit } = productDto;

    // Инициализация пустого массива для хранения ошибок
    const errors: string[] = [];

    // Проверка наличия и корректности имени продукта
    if (typeof name !== 'string' || name.length < 3 || name.length > 100) {
      errors.push('Название продукта должно быть строкой от 3 до 100 символов');
    }

    // Проверка наличия и корректности кода Azenco
    if (typeof azencoCode !== 'string' || azencoCode.length !== 9) {
      errors.push('Код Azenco должен состоять из 9 символов');
    }

    // Проверка наличия и корректности цены
    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
      errors.push('Цена должна быть числом больше 0');
    }

    // Проверка наличия и корректности типа продукта
    if (typeof type !== 'string' || type.length <= 1) {
      errors.push('Тип должен быть строкой длиной больше 1 символа');
    }

    // Проверка наличия и корректности единицы измерения
    if (typeof unit !== 'string') {
      errors.push(
        'Единица измерения должна быть строкой длиной больше 1 символа',
      );
    }

    // Проверка наличия продукта с таким же именем
    const existingProductName = await this.findByNameProduct(name);
    if (existingProductName?.product) {
      errors.push('ProductName уже есть в базе данных');
    }

    // Проверка наличия продукта с таким же кодом Azenco
    const existingProductAzencoCode =
      await this.findByAzencoCodeProduct(azencoCode);
    if (existingProductAzencoCode?.product) {
      errors.push('Azenco Code уже есть в базе данных');
    }

    // Возврат ошибок, если они были обнаружены
    if (errors.length > 0) return errors.join(', ');

    // Если ошибок нет, возвращаем пустую строку (нет ошибок)
    return '';
  }

  // Метод для пагинации, фильтрации или сортировки продуктов
  async paginateAndFilterOrSortProducts(
    query: IProductsQuery,
  ): Promise<ICountAndRowsProductsResponse> {
    try {
      const { limit, offset, sortBy, priceFrom, priceTo, bolt, PRR, earring } =
        query;

      if (!limit && !offset) {
        const { count, rows } = await this.productModel.findAndCountAll({
          limit: 20,
          offset: 0,
        });

        rows.forEach(this.processProductPrice);
        return { count, rows };
      }

      const filter: Partial<IProductsFilter> = {};

      if (priceFrom && priceTo) {
        filter.price = {
          [Op.between]: [+priceFrom, +priceTo],
        };
      }

      if (bolt) filter.bolt = JSON.parse(decodeURIComponent(bolt));

      if (PRR) {
        filter.PRR = JSON.parse(decodeURIComponent(PRR));
      }

      if (earring) {
        filter.earring = JSON.parse(decodeURIComponent(earring));
      }

      const orderDirection = sortBy === 'asc' ? 'asc' : 'desc';

      const { count, rows } = await this.productModel.findAndCountAll({
        limit: +limit,
        offset: +offset * +limit,
        where: filter,
        order: [[Sequelize.literal('CAST(price AS DECIMAL)'), orderDirection]],
      });

      rows.forEach(this.processProductPrice);
      return { count, rows };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для добавления нового продукта
  async addProduct(
    productDto: CreateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    try {
      // const validationError = await this.validateProduct({ productDto });
      // if (validationError)
      //   return { error_message: validationError, success: false };

      const product = await this.productModel.create({ ...productDto });
      return {
        success: true,
        message: `Создан товар ${product.name}`,
        product,
      };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для обновления информации о продукте
  async updateProduct({
    productId,
    updatedProduct,
  }: IUpdateProduct): Promise<IAddAndUpdateProduct> {
    try {
      // Находим продукт по его идентификатору
      const { product, error_message } = await this.findOneProduct(productId);

      if (error_message) return { success: false, error_message };

      // Обновляем поля продукта на основе данных из DTO
      product.name =
        updatedProduct.name && updatedProduct.name.length > 2
          ? updatedProduct.name
          : product.name;

      product.azencoCode =
        updatedProduct.azencoCode && updatedProduct.azencoCode.length > 2
          ? updatedProduct.azencoCode
          : product.azencoCode;

      product.price =
        updatedProduct.price && updatedProduct.price > 0
          ? +updatedProduct.price
          : +product.price;

      product.type =
        updatedProduct.type && updatedProduct.type.length >= 1
          ? updatedProduct.type
          : product.type;

      product.unit = !!updatedProduct.unit ? updatedProduct.unit : product.unit;

      product.img =
        updatedProduct.img && updatedProduct.img.length >= 1
          ? updatedProduct.img
          : product.img;

      // Сохраняем обновленный продукт в базе данных
      await product.save();

      // Обрабатываем цену продукта (возможно, применяем какие-то дополнительные действия)
      await this.processProductPrice(product);

      // Возвращаем успешный результат обновления продукта
      return {
        success: true,
        message: `Успешно обновлен ${product.name}`,
        product: product,
      };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для удаления продукта
  async removeProduct(id: number): Promise<IDeleteProduct> {
    try {
      const { product, error_message } = await this.findOneProduct(id);
      if (error_message) return { error_message };
      await product.destroy();
      return { message: `Продукт "${product.name}" удален успешно` };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  async importJSON(json: string) {
    try {
      const products = JSON.parse(json);

      this.errorsService.log(json);

      // for (let index = 0; index < products.length; index++) {
      //   const element = products[index];
      //   this.errorsService.log(element);
      //   await this.addProduct(element);
      // }

      const result = await this.productModel.bulkCreate(products);
      this.errorsService.log('result');
      this.errorsService.log([...result]);

      if (result.length) {
        const createdProducts = await this.findProducts();
        return { createdProducts };
      }
      return { message: 'не получилось !' };
    } catch (error) {
      return this.errorsService.errorsMessage(error);
    }
  }
}

// ('[{'id':1,'name':'3200х12000х2800икиотаглыдящлизликонтейнер','azencoCode':'M00011278','price':10771.57,'type':'digər','unit':'ədəd'},{'id':2,'name':'Akkumlyator45AHvolten','azencoCode':'M00045768','price':95.0,'type':'akkumlyator','unit':'ədəd'},{"id":3,"name":"Antenakabeli100metr","azencoCode":"M00037508","price":27.0,"type":"kabel","unit":"ədəd"},{"id":4,"name":"AralıqbəndPTM12-2","azencoCode":"000027116","price":14.32,"type":"bənd","unit":"ədəd"},{"id":5,"name":"AralıqbəndPTM12-3","azencoCode":"S58003968","price":13.2,"type":"bənd","unit":"ədəd"},{"id":6,"name":"AralıqhissəPR12-6","azencoCode":"000055758","price":7.1,"type":"digər","unit":"ədəd"},{"id":7,"name":"AralıqhissəPRR-16-1a","azencoCode":"M00038363","price":20.55,"type":"digər","unit":"ədəd"},{"id":8,"name":"AsmadəstiOPEB","azencoCode":"M00022642","price":106.0,"type":"digər","unit":"ədəd"},{"id":9,"name":"Asmasıxac2PQN5-7","azencoCode":"M00034187","price":194.05,"type":"digər","unit":"ədəd"},{"id":10,"name":"AsmasıxacPQ-3-12","azencoCode":"S58611995","price":15.39,"type":"digər","unit":"ədəd"},{"id":11,"name":"Açar32","azencoCode":"000000468","price":10.8,"type":"digər","unit":"ədəd"},{"id":12,"name":"Balış","azencoCode":"000000470","price":3.01,"type":"digər","unit":"ədəd"},{"id":13,"name":"Balışüzü","azencoCode":"000000925","price":6.71,"type":"digər","unit":"ədəd"},{"id":14,"name":"BirləşdiricisıxacSOAS-120-3","azencoCode":"S58631958","price":4.48,"type":"digər","unit":"ədəd"},{"id":15,"name":"BirləşdiricisıxacSOAS-95-3","azencoCode":"000027677","price":4.29,"type":"digər","unit":"ədəd"},{"id":16,"name":"Boyaalminium","azencoCode":"000027682","price":2.42,"type":"digər","unit":"ədəd"},{"id":17,"name":"BoltM16x50","azencoCode":"000011971","price":5.2,"type":"digər","unit":"ədəd"},{"id":18,"name":"BoltM20x50","azencoCode":"000012909","price":0.44,"type":"digər","unit":"ədəd"},{"id":19,"name":"BoltM27x100","azencoCode":"000051848","price":0.57,"type":"digər","unit":"ədəd"},{"id":20,"name":"BoltM30x70","azencoCode":"000013034","price":2.42,"type":"digər","unit":"ədəd"},{"id":21,"name":"BoltM27x90","azencoCode":"S58002469","price":2.38,"type":"digər","unit":"ədəd"},{"id":22,"name":"Bolt,qaykaşayba","azencoCode":"S59682036","price":4.0,"type":"digər","unit":"ədəd"},{"id":23,"name":"BoltataxılansıxacNB-2-6","azencoCode":"M00019379","price":1.0,"type":"digər","unit":"ədəd"},{"id":24,"name":"BoruqofrlanmışDN400PPH","azencoCode":"000055799","price":15.39,"type":"digər","unit":"ədəd"},{"id":25,"name":"Boruqofrlanmış(büzməli)Dn50","azencoCode":"M00007305","price":31.68,"type":"digər","unit":"ədəd"},{"id":26,"name":"Boruplastik800x47,4","azencoCode":"M00005701","price":0.71,"type":"digər","unit":"ədəd"},{"id":27,"name":"BoruPPR25","azencoCode":"000052086","price":192.19,"type":"digər","unit":"ədəd"},{"id":28,"name":"Buraz(tros-4ayaqlısapand40tx4m)","azencoCode":"S58617755","price":0.9,"type":"digər","unit":"ədəd"},{"id":29,"name":"Buraz(tros-4ayaqlısapand50tx4m)","azencoCode":"S58631554","price":357.0,"type":"digər","unit":"ədəd"},{"id":30,"name":"BərkitməqovşağıKQN-7-5","azencoCode":"S58631549","price":565.14,"type":"digər","unit":"ədəd"},{"id":31,"name":"Vintilkarabin11mm","azencoCode":"S58006260","price":12.43,"type":"digər","unit":"ədəd"},{"id":32,"name":"QaykaM16","azencoCode":"M00007582","price":0.97,"type":"digər","unit":"ədəd"},{"id":33,"name":"QaykaM20","azencoCode":"000052780","price":0.15,"type":"digər","unit":"ədəd"},{"id":34,"name":"QaykaM24","azencoCode":"000013346","price":0.28,"type":"digər","unit":"ədəd"},{"id":35,"name":"QaykaM27","azencoCode":"000013349","price":0.43,"type":"digər","unit":"ədəd"},{"id":36,"name":"QayçıyakarN16","azencoCode":"000016080","price":1.01,"type":"digər","unit":"ədəd"},{"id":37,"name":"QoruyujuekranEZ-500-1A","azencoCode":"M00044978","price":86.4,"type":"digər","unit":"ədəd"},{"id":38,"name":"Qoruyucukəmərparaşüttiplibeldəstəkli","azencoCode":"000002473","price":81.13,"type":"digər","unit":"ədəd"},{"id":39,"name":"QulaqcıqU1-7-16","azencoCode":"S59650595","price":13.03,"type":"digər","unit":"ədəd"},{"id":40,"name":"QulaqcıqU1K-7-16","azencoCode":"000028920","price":5.13,"type":"digər","unit":"ədəd"},{"id":41,"name":"QulaqcıqU2K-7-16","azencoCode":"000056131","price":3.34,"type":"digər","unit":"ədəd"},{"id":42,"name":"DayaqsıxacıPQ-2-11D","azencoCode":"000056132","price":4.32,"type":"digər","unit":"ədəd"},{"id":43,"name":"DayaqsıxacıPQ-2-11D","azencoCode":"000056158","price":3.58,"type":"digər","unit":"ədəd"},{"id":44,"name":"QulaqcıqU2K-7-16","azencoCode":"000016516","price":6.41,"type":"digər","unit":"ədəd"},{"id":45,"name":"QulaqcıqU2K-7-16","azencoCode":"M00039334","price":42.55,"type":"digər","unit":"ədəd"},{"id":46,"name":"DayaqsıxacıPQ-2-11D","azencoCode":"S58611979","price":58.59,"type":"digər","unit":"ədəd"},{"id":47,"name":"DayaqsıxacıPQN-3-5","azencoCode":"S59652507","price":6.53,"type":"digər","unit":"ədəd"},{"id":48,"name":"DartmasıxacNas-330-1","azencoCode":"M00040865","price":0.0,"type":"digər","unit":"ədəd"},{"id":49,"name":"DartmasıxacNas-600-1","azencoCode":"M00041023","price":512.51,"type":"digər","unit":"ədəd"},{"id":50,"name":"Döşəkağı","azencoCode":"M00045788","price":379.58,"type":"digər","unit":"ədəd"},{"id":51,"name":"DəmirbetonbünövrəB1-2","azencoCode":"M00041714","price":709.93,"type":"digər","unit":"ədəd"},{"id":52,"name":"DəmirbetonbünövrəB1-A","azencoCode":"S58018385","price":993.46,"type":"digər","unit":"ədəd"},{"id":53,"name":"DəmirbetonbünövrəB3-2","azencoCode":"M00001275","price":95.14,"type":"digər","unit":"ədəd"},{"id":54,"name":"DemirbetonbünövrəB3-A(D)","azencoCode":"S59650647","price":2.62,"type":"digər","unit":"ədəd"},{"id":55,"name":"DemirbetondayaqSK26,1","azencoCode":"M00005716","price":2.04,"type":"digər","unit":"ədəd"},{"id":56,"name":"DəmirbetonriqelAP-5","azencoCode":"000003219","price":31.49,"type":"digər","unit":"ədəd"},{"id":57,"name":"Dəmirbolt27x100","azencoCode":"000030293","price":9.74,"type":"digər","unit":"ədəd"},{"id":58,"name":"Dəmirbolt27x70","azencoCode":"M00026619","price":23.23,"type":"digər","unit":"ədəd"},{"id":59,"name":"EkranqoruyucusuEZ500-5","azencoCode":"000030601","price":4.55,"type":"digər","unit":"ədəd"},{"id":60,"name":"EkranlarınbərkidməbəndiUKE-6Q","azencoCode":"M00009646","price":300.74,"type":"bənd","unit":"ədəd"},{"id":61,"name":"ElektriklampaLED50V","azencoCode":"000062761","price":1.9,"type":"digər","unit":"ədəd"},{"id":62,"name":"JAJ50-3B","azencoCode":"S58612477","price":9.0,"type":"digər","unit":"ədəd"},{"id":63,"name":"İkilaylıçarpayı(2020x800x2140mm)","azencoCode":"000004085","price":46.86,"type":"digər","unit":"ədəd"},{"id":64,"name":"Yanmışməftil5mm","azencoCode":"S58631957","price":13.11,"type":"digər","unit":"ədəd"},{"id":65,"name":"Yağmurluq(plaş)","azencoCode":"000024302","price":4.59,"type":"digər","unit":"ədəd"},{"id":66,"name":"Yorğan","azencoCode":"M00006550","price":6.03,"type":"digər","unit":"ədəd"},{"id":67,"name":"Yorğanüzü","azencoCode":"T00002087","price":1503.96,"type":"digər","unit":"ədəd"},{"id":68,"name":"KabelAPvPuq1x95/2510kv","azencoCode":"M00022851","price":250.0,"type":"kabel","unit":"ədəd"},{"id":69,"name":"KabelVVQz(M)4x161kv","azencoCode":"123584","price":398.5,"type":"kabel","unit":"ədəd"},{"id":70,"name":"KD-26,1-2.2d/bdayaq","azencoCode":"M00007714","price":836.63,"type":"digər","unit":"ədəd"},{"id":71,"name":"KondisionerAlarko","azencoCode":"000015719","price":755.49,"type":"digər","unit":"ədəd"},{"id":72,"name":"KondisionerJhigo","azencoCode":"S58626960","price":867.71,"type":"digər","unit":"ədəd"},{"id":73,"name":"KondisionerJarrer12713","azencoCode":"000015726","price":604.0,"type":"digər","unit":"ədəd"},{"id":74,"name":"KondisionerLG-1260HL","azencoCode":"S58017802","price":0.0,"type":"digər","unit":"ədəd"},{"id":75,"name":"KondisionerHitajiRASJ-24HPA","azencoCode":"000054424","price":11.19,"type":"digər","unit":"ədəd"},{"id":76,"name":"KondisionerHUNDAİ50GV","azencoCode":"000005274","price":6.0,"type":"digər","unit":"ədəd"},{"id":77,"name":"Konteynerofis3000x3000x12000mm(2otaqlı,dəhlizli)","azencoCode":"000005276","price":3.36,"type":"digər","unit":"ədəd"},{"id":78,"name":"Koromıslo2KU-12-1","azencoCode":"S59657513","price":0.0,"type":"digər","unit":"ədəd"},{"id":79,"name":"Lapatkadüz","azencoCode":"S58011836","price":0.0,"type":"digər","unit":"ədəd"},{"id":80,"name":"Lapatkasapı","azencoCode":"S58620594","price":11.8,"type":"digər","unit":"ədəd"},{"id":81,"name":"Liflioptikkabel","azencoCode":"000005587","price":190.0,"type":"kabel","unit":"ədəd"},{"id":82,"name":"LiftliikizirehlikabelFO12","azencoCode":"S58070198","price":114.96,"type":"kabel","unit":"ədəd"},{"id":83,"name":"Lomböyük","azencoCode":"M00042081","price":0.0,"type":"digər","unit":"ədəd"},{"id":84,"name":"Masa","azencoCode":"000020066","price":1304.47,"type":"digər","unit":"ədəd"},{"id":85,"name":"MatriskomplektiP-100MA","azencoCode":"M00046777","price":0.0,"type":"digər","unit":"ədəd"},{"id":86,"name":"MetalankerdayaqU-220-3+9","azencoCode":"M00045863","price":13238.9,"type":"digər","unit":"ədəd"},{"id":87,"name":"Metalbadya","azencoCode":"M00046614","price":47336.0,"type":"digər","unit":"ədəd"},{"id":88,"name":"MetaldayaqP330-3","azencoCode":"M00046926","price":28250.53,"type":"digər","unit":"ədəd"},{"id":89,"name":"MetaldayaqU110-1","azencoCode":"M00041502","price":1.89,"type":"digər","unit":"ədəd"},{"id":90,"name":"MetaldayaqU330-2+9","azencoCode":"000054068","price":0.0,"type":"digər","unit":"ədəd"},{"id":91,"name":"MetaldayaqU330-3+5","azencoCode":"000054070","price":3.33,"type":"digər","unit":"ədəd"},{"id":92,"name":"MetaldayaqhissələriU220-2","azencoCode":"000054072","price":2.46,"type":"digər","unit":"ədəd"},{"id":93,"name":"NaqilAJ240/32","azencoCode":"M00037642","price":5.62,"type":"digər","unit":"ədəd"},{"id":94,"name":"NaqilAJ70/11","azencoCode":"M00005029","price":3.64,"type":"digər","unit":"ədəd"},{"id":95,"name":"NaqilAJ-120/19","azencoCode":"000071850","price":1.04,"type":"digər","unit":"ədəd"},{"id":96,"name":"NaqilAS330/43mm2","azencoCode":"M00003666","price":14.0,"type":"digər","unit":"ədəd"},{"id":97,"name":"NaqilAS-120/19","azencoCode":"M00016369","price":1.0,"type":"digər","unit":"ədəd"},{"id":98,"name":"NaqilSiP-42x16","azencoCode":"M00017752","price":0.0,"type":"digər","unit":"ədəd"},{"id":99,"name":"Nivelirxətkeşi","azencoCode":"M00034804","price":0.0,"type":"digər","unit":"ədəd"},{"id":100,"name":"Nişanşar(qırmızı)","azencoCode":"000067358","price":186.57,"type":"digər","unit":"ədəd"},{"id":101,"name":"OKQ-Tç1-48-11,7","azencoCode":"M00043598","price":2.76,"type":"digər","unit":"ədəd"},{"id":102,"name":"OKQT-ç-1-24-11,7","azencoCode":"M00044273","price":10.53,"type":"digər","unit":"ədəd"},{"id":103,"name":"Oksigenbalonu(klapanlıvəqoruyucuqapaqla)","azencoCode":"000067597","price":0.96,"type":"digər","unit":"ədəd"},{"id":104,"name":"OptikkabelOPGW-24BI-70","azencoCode":"M00038834","price":178.95,"type":"kabel","unit":"ədəd"},{"id":105,"name":"Oturacaqtabletka0,35x0,41","azencoCode":"000068220","price":15.0,"type":"digər","unit":"ədəd"},{"id":106,"name":"Palatnosarı","azencoCode":"000069106","price":0.0,"type":"digər","unit":"ədəd"},{"id":107,"name":"Paltarşkafı1,80x0,40x0,80","azencoCode":"S59653117","price":0.0,"type":"digər","unit":"ədəd"},{"id":108,"name":"Plastinka","azencoCode":"M00043166","price":86.44,"type":"digər","unit":"ədəd"},{"id":109,"name":"PresləməsıxajSAS300-1","azencoCode":"000070172","price":16.3,"type":"digər","unit":"ədəd"},{"id":110,"name":"Propanqazıbalonlabirlikdə","azencoCode":"000070174","price":0.0,"type":"digər","unit":"ədəd"},{"id":111,"name":"RadiatorTimberkTor212009DJL","azencoCode":"000007480","price":55.67,"type":"digər","unit":"ədəd"},{"id":112,"name":"RasporkaRQ2-400","azencoCode":"S58622122","price":0.0,"type":"digər","unit":"ədəd"},{"id":113,"name":"RasporkaRQ2-600","azencoCode":"M00041212","price":72.0,"type":"digər","unit":"ədəd"},{"id":114,"name":"RatsiyaMT500","azencoCode":"000021318","price":106.8,"type":"digər","unit":"ədəd"},{"id":115,"name":"Rezak","azencoCode":"M00047301","price":120.0,"type":"digər","unit":"ədəd"},{"id":116,"name":"Remen6t6mt","azencoCode":"S58622251","price":191.46,"type":"digər","unit":"ədəd"},{"id":117,"name":"Remen6t8m","azencoCode":"S58622254","price":263.52,"type":"digər","unit":"ədəd"},{"id":118,"name":"Remen8t6n","azencoCode":"000007728","price":69.05,"type":"digər","unit":"ədəd"},{"id":119,"name":"Rolik(polad)2ton75mm","azencoCode":"000007729","price":45.03,"type":"digər","unit":"ədəd"},{"id":120,"name":"Rolik(polad)4ton115mm","azencoCode":"000007730","price":123.56,"type":"digər","unit":"ədəd"},{"id":121,"name":"RolikMIP-5","azencoCode":"S58625257","price":11.46,"type":"digər","unit":"ədəd"},{"id":122,"name":"RolikMIP-6","azencoCode":"000013608","price":0.0,"type":"digər","unit":"ədəd"},{"id":123,"name":"RolikMIP-7","azencoCode":"S58015328","price":9.03,"type":"digər","unit":"ədəd"},{"id":124,"name":"SancaqM27x600","azencoCode":"000039256","price":0.0,"type":"digər","unit":"ədəd"},{"id":125,"name":"SancaqM27x650","azencoCode":"000039776","price":40.2,"type":"digər","unit":"ədəd"},{"id":126,"name":"SancaqM30x650","azencoCode":"M00015913","price":210.0,"type":"digər","unit":"ədəd"},{"id":127,"name":"Sas300","azencoCode":"000073168","price":1.95,"type":"digər","unit":"ədəd"},{"id":128,"name":"Skoba25","azencoCode":"M00038368","price":120.26,"type":"digər","unit":"ədəd"},{"id":129,"name":"SoyuducuParis-40","azencoCode":"000056490","price":13.0,"type":"digər","unit":"ədəd"},{"id":130,"name":"SırğaSPS-7-16","azencoCode":"M00042390","price":33.05,"type":"digər","unit":"ədəd"},{"id":131,"name":"Sıxac-ZajimMK-3Klin=2","azencoCode":"58013772","price":0.87,"type":"digər","unit":"ədəd"},{"id":132,"name":"SıxacPA-5-1","azencoCode":"S58022539","price":180.83,"type":"digər","unit":"ədəd"},{"id":133,"name":"Termosplasmassuüçün20lt","azencoCode":"S58022541","price":191.28,"type":"digər","unit":"ədəd"},{"id":134,"name":"Texnikioksigenqazı","azencoCode":"M00007271","price":17.29,"type":"digər","unit":"ədəd"},{"id":135,"name":"TorpaqlamaalətiZPLŞM-110-220","azencoCode":"M00019015","price":197.35,"type":"digər","unit":"ədəd"},{"id":136,"name":"TorpaqlamaalətiZPLŞM-330-500","azencoCode":"M00012456","price":96.0,"type":"digər","unit":"ədəd"},{"id":137,"name":"TorpaqlamabirləşdiriciD16x4500mm","azencoCode":"M00047167","price":82.0,"type":"digər","unit":"ədəd"},{"id":138,"name":"TraversB5JL=4mhissələri","azencoCode":"M00033662","price":87.0,"type":"digər","unit":"ədəd"},{"id":139,"name":"Tros188metr","azencoCode":"M00047190","price":157.0,"type":"digər","unit":"ədəd"},{"id":140,"name":"Tros20L=6m","azencoCode":"M00023333","price":97.62,"type":"digər","unit":"ədəd"},{"id":141,"name":"Tros22(6m)","azencoCode":"M00034816","price":430.57,"type":"digər","unit":"ədəd"},{"id":142,"name":"Tros24L=8m","azencoCode":"M00044466","price":345.0,"type":"digər","unit":"ədəd"},{"id":143,"name":"Tros276m-lik","azencoCode":"T00000221","price":48.09,"type":"digər","unit":"ədəd"},{"id":144,"name":"Tros70mx16mm","azencoCode":"S58625534","price":140.7,"type":"digər","unit":"ədəd"},{"id":145,"name":"TrosbaşıbağlıF16mm,L=70,00metr","azencoCode":"M00041475","price":335.0,"type":"digər","unit":"ədəd"},{"id":146,"name":"TrossaxlayandayaqL=2m","azencoCode":"M00041473","price":65.0,"type":"digər","unit":"ədəd"},{"id":147,"name":"TrosF12hörgülü70m-lik","azencoCode":"M00044275","price":75.37,"type":"digər","unit":"ədəd"},{"id":148,"name":"TrosF16L70m","azencoCode":"M00004972","price":0.0,"type":"digər","unit":"ədəd"},{"id":149,"name":"TrosF188m","azencoCode":"M00014918","price":2.0,"type":"digər","unit":"ədəd"},{"id":150,"name":"Tumba0,30x0,60x0,70","azencoCode":"S58002170","price":150.75,"type":"digər","unit":"ədəd"},{"id":151,"name":"UşəkillisancaqM36x2400","azencoCode":"S59677659","price":282.72,"type":"digər","unit":"ədəd"},{"id":152,"name":"Fırça4","azencoCode":"000015920","price":0.0,"type":"digər","unit":"ədəd"},{"id":153,"name":"ÜçayaqET-10teodalitüçün","azencoCode":"S58017833","price":90.57,"type":"digər","unit":"ədəd"},{"id":154,"name":"Çarpayı","azencoCode":"M00037873","price":15.0,"type":"digər","unit":"ədəd"},{"id":155,"name":"Çarpayı(döşəkortopedik)","azencoCode":"000013843","price":4.31,"type":"digər","unit":"ədəd"},{"id":156,"name":"ÇARPAYIORTOPEDİKDÖŞƏK","azencoCode":"000013844","price":0.15,"type":"digər","unit":"ədəd"},{"id":157,"name":"Çarpayısökülmüş","azencoCode":"M00013119","price":0.39,"type":"digər","unit":"ədəd"},{"id":158,"name":"ŞaybaM27","azencoCode":"000013845","price":0.15,"type":"digər","unit":"ədəd"},{"id":159,"name":"ŞaybaM27","azencoCode":"000023071","price":234.0,"type":"digər","unit":"ədəd"},{"id":160,"name":"ŞaybaM27düz","azencoCode":"S59664335","price":40.77,"type":"digər","unit":"ədəd"},{"id":161,"name":"ŞaybaM30","azencoCode":"ŞaybaM30","price":1,"type":"digər","unit":"ədəd"},{"id":162,"name":"Şarnir545x400x495","azencoCode":"Şarnir545x400x495","price":1,"type":"digər","unit":"ədəd"},{"id":163,"name":"HalqaEZ-750-1A","azencoCode":"HalqaEZ-750-1A","price":1,"type":"digər","unit":"ədəd"}]');
