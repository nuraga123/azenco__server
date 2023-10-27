import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
import { databaseConfig } from 'src/config/configuration';
// model
import { User } from 'src/users/users.model';
import { ShoppingCart } from 'src/shopping-cart/shopping-cart.model';
// module
import { BoilerPartsModule } from 'src/boiler-parts/boiler-parts.module';
import { ShoppingCartModule } from 'src/shopping-cart/shopping-cart.module';
//service
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { UsersService } from 'src/users/users.service';
import { SequelizeConfigService } from 'src/config/sequelizeConfig.service';
import { ShoppingCartService } from 'src/shopping-cart/shopping-cart.service';

const mockedUser = {
  username: 'Jhon',
  email: 'jonh123@gmail.com',
  password: 'jonh123',
};

describe('Shopping Cart Service', () => {
  let app: INestApplication;
  let boilerPartsService: BoilerPartsService;
  let usersService: UsersService;
  let shoppingCartService: ShoppingCartService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          useClass: SequelizeConfigService,
        }),
        ConfigModule.forRoot({
          load: [databaseConfig],
        }),
        ShoppingCartModule,
        BoilerPartsModule,
      ],
    }).compile();

    boilerPartsService = testModule.get<BoilerPartsService>(BoilerPartsService);
    usersService = testModule.get<UsersService>(UsersService);
    shoppingCartService =
      testModule.get<ShoppingCartService>(ShoppingCartService);

    app = testModule.createNestApplication();

    app.use(passport.initialize());
    app.use(passport.session());

    await app.init();
  });

  beforeEach(async () => {
    const user = new User();

    const hashedPassword = await bcrypt.hash(mockedUser.password, 10);

    user.username = mockedUser.username;
    user.password = hashedPassword;
    user.email = mockedUser.email;

    return user.save();
  });

  beforeEach(async () => {
    const cart = new ShoppingCart();

    const user = await usersService.findOne({
      where: { username: mockedUser.username },
    });

    const part = await boilerPartsService.findOne(1);

    cart.userId = user.id;
    cart.partId = part.id;
    cart.boiler_manufacturer = part.boiler_manufacturer;
    cart.parts_manufacturer = part.parts_manufacturer;
    cart.price = part.price;
    cart.in_stock = part.in_stock;
    cart.image = JSON.parse(part.images)[0];
    cart.name = part.name;
    cart.total_price = part.price;

    return cart.save();
  });

  afterEach(async () => {
    await User.destroy({ where: { username: mockedUser.username } });
    await ShoppingCart.destroy({ where: { partId: 1 } });
  });

  it('should return all cart items', async () => {
    const user = await usersService.findOne({
      where: { username: mockedUser.username },
    });

    const cart = await shoppingCartService.findAll(user.id);

    cart.forEach((item) =>
      expect(item.dataValues).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          userId: user.id,
          partId: expect.any(Number),
          boiler_manufacturer: expect.any(String),
          price: expect.any(Number),
          parts_manufacturer: expect.any(String),
          name: expect.any(String),
          image: expect.any(String),
          in_stock: expect.any(Number),
          count: expect.any(Number),
          total_price: expect.any(Number),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      ),
    );
  });

  it('should add cart item', async () => {
    await shoppingCartService.add({
      username: mockedUser.username,
      partId: 5,
    });

    const user = await usersService.findOne({
      where: { username: mockedUser.username },
    });

    const cart = await shoppingCartService.findAll(user.id);

    expect(cart.find((item) => item.partId === 5)).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        userId: user.id,
        partId: 5,
        boiler_manufacturer: expect.any(String),
        price: expect.any(Number),
        parts_manufacturer: expect.any(String),
        name: expect.any(String),
        image: expect.any(String),
        in_stock: expect.any(Number),
        count: expect.any(Number),
        total_price: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should return updated count of cart item', async () => {
    const result = await shoppingCartService.updateCount(5, 1);
    expect(result).toEqual({ count: 5 });
  });

  it('should return updated total price of cart item', async () => {
    const part = await boilerPartsService.findOne(1);
    const result = await shoppingCartService.updateTotalPrice(
      part.price * 3,
      1,
    );
    expect(result).toEqual({ total_price: part.price * 3 });
  });

  it('should delete cart item', async () => {
    await shoppingCartService.remove(1);
    const user = await usersService.findOne({
      where: {
        username: mockedUser.username,
      },
    });

    const cart = await shoppingCartService.findAll(user.id);

    expect(cart.find((el) => el.partId === 1)).toBeUndefined();
  });

  it('should delete all cart item', async () => {
    const user = await usersService.findOne({
      where: {
        username: mockedUser.username,
      },
    });

    await shoppingCartService.removeAll(user.id);

    const cart = await shoppingCartService.findAll(user.id);

    expect(cart).toStrictEqual([]);
  });
});
