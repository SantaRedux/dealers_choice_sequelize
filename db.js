const Sequelize = require("sequelize");
const {
  DataTypes: { DATE, STRING, INTEGER, UUID, UUIDV4 },
} = Sequelize;
// const conn = new Sequelize("postgres://localhost/paintings_db");
const conn = new Sequelize("postgres://postgres:dbpw@localhost/paintings_db");

// const username = "postgres";
// const password = "dbpw";
// const host = "localhost";
// const database = "paintings_db";

// const conn = new Sequelize(database, username, password, {
//   host,
//   dialect: "postgres",
//   logging: false,
// });

const nationality = ["Italy", "Spain", "France"];

const painters = ["Picasso", "Modigliani", "Monet"];

const styles = ["cubism", "expressionism", "impressionism"];

const Nationality = conn.define("nationality", {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  name: STRING,
});

const Painter = conn.define("painter", {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  name: STRING,
  birth: DATE,
});

Painter.prototype.findPaintings = function () {
  return Painting.findAll({
    where: {
      parentId: this.id,
    },
  });
};

const Style = conn.define("style", {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  name: STRING,
});

const Painting = conn.define("painting", {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  name: STRING,
  caption: STRING,
  year: INTEGER,
});

Style.belongsTo(Style, { as: "parent-style" });
Style.hasMany(Style, { as: "child-style" });

Painter.belongsTo(Nationality);
Nationality.hasMany(Painter);

Painting.belongsTo(Painter);
Painter.hasMany(Painting);

Painting.belongsTo(Style);
Style.hasMany(Painting);

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const [italy, spain, france] = await Promise.all(
    nationality.map((name) => Nationality.create({ name }))
  );
  const [picasso, modigliani, monet] = await Promise.all(
    painters.map((name) => Painter.create({ name }))
  );
  const [cubism, expressionism, impressionism] = await Promise.all(
    styles.map((name) => Style.create({ name }))
  );
  picasso.nationalityId = spain.id;
  modigliani.nationalityId = italy.id;
  monet.nationalityId = france.id;

  await Promise.all([picasso.save(), modigliani.save(), monet.save()]);
  await Promise.all([
    Painting.create({
      name: "Guernica",
      painterId: picasso.id,
      styleId: cubism.id,
    }),
    Painting.create({
      name: "Portrait of Jeanne Hebuterne",
      painterId: modigliani.id,
      styleId: expressionism.id,
    }),
    Painting.create({
      name: "The Artist's Garden at Giverny",
      painterId: monet.id,
      styleId: impressionism.id,
    }),
  ]);
};

module.exports = {
  syncAndSeed,
  models: {
    Painter,
    Style,
    Painting,
  },
};
