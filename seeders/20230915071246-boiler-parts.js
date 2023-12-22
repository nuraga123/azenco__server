const { faker } = require('@faker-js/faker');
const moment = require('moment-timezone');

('use strict');

const boilerManufacturers = [
  'Ariston',
  'Chaffoteaux&Maury',
  'Baxi',
  'Bongioanni',
  'Saunier Duval',
  'Buderus',
  'Strategist',
  'Henry',
  'Northwest',
];

const partsManufacturers = [
  'Azure',
  'Gloves',
  'Cambridgeshire',
  'Salmon',
  'Montana',
  'Sensor',
  'Lesly',
  'Radian',
  'Gasoline',
  'Croatia',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const utcOffset = 4 * 60;
    return queryInterface.bulkInsert(
      'BoilerParts',
      [...Array(100)].map(() => {
        const now = moment().utcOffset(utcOffset);
        const createdAt = now.format('YYYY-MM-DD HH:mm:ss');
        const updatedAt = now.format('YYYY-MM-DD HH:mm:ss');

        return {
          boiler_manufacturer:
            boilerManufacturers[
              Math.floor(Math.random() * boilerManufacturers.length)
            ],
          parts_manufacturer:
            partsManufacturers[
              Math.floor(Math.random() * partsManufacturers.length)
            ],
          price: faker.random.numeric(4),
          name: faker.lorem.sentence(2),
          description: faker.lorem.sentence(10),
          images: JSON.stringify(
            [...Array(7)].map(
              () =>
                `${faker.image.technics()}?random=${faker.random.numeric(30)}`,
            ),
          ),
          vendor_code: faker.internet.password(),
          in_stock: faker.random.numeric(1),
          bestseller: faker.datatype.boolean(),
          new: faker.datatype.boolean(),
          popularity: faker.random.numeric(3),
          compatibility: faker.lorem.sentence(7),
          createdAt,
          updatedAt,
        };
      }),
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('BoilerParts', null, {});
  },
};
