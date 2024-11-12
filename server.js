const express = require("express");
const app = express();
const db = require("./db");
const {
  models: { Nationality, Painter, Style, Painting },
} = db;

app.get("/", async (req, res, next) => {
  res.redirect("/paintings");
});

app.get("/paintings", async (req, res, next) => {
  try {
    const paintings = await Painting.findAll({
      include: [Painter, Style],
    });

    const painters = await paintings.map((painting) =>
      Painter.findByPk(painting.painterId.name)
    );

    res.send(`
                <html>
                    <head></head>
                    <body>
                        <div>${paintings
                          .map(
                            (painting, idx) =>
                              `<li>${painting.name}, by ${painters[idx]}. idx: ${idx}. painterId: ${painting.painterId}</li>`
                          )
                          .join("")}</div>
                          <div>${painters}</div>
                    </body>
                </html>`);
  } catch (ex) {
    next(ex);
  }
});

app.get("/painters", async (req, res, next) => {
  try {
    const painters = await Painter.findAll({
      // include: [ Nationality ]
    });

    res.send(`
                <html>
                    <head></head>
                    <body>
                        <div>${painters.map(
                          (painter) => `<li>${painter.name}</li>`
                        )}</div>
                    </body>
                </html>`);
    console.log("LOOK HERE NOW!!! - " + painters);
  } catch (ex) {
    next(ex);
  }
});

app.get("/painters/:id", async (req, res, next) => {
  try {
    const painter = await Painter.findByPk(req.params.id);
    res.send(await painter.findPaintings());
  } catch (ex) {
    next(ex);
  }
});

const liftoff = async () => {
  try {
    await db.syncAndSeed();
    const port = process.env.port || 1338;
    app.listen(port, () => console.log(`listening on ${port}`));
  } catch (ex) {
    console.log(ex);
  }
};

liftoff();
