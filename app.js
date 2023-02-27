require("dotenv").config();
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");
const {
  MYSQL_DB_HOST,
  MYSQL_DB_NAME,
  MYSQL_DB_PASSWORD,
  MYSQL_DB_PORT,
  MYSQL_DB_USER,
} = process.env;
const {
  getCerdo,
  getListado,
  getOfertas,
  getPescado,
  getPollo,
  getVaca,
  getOfertasNames,
  getCerdoMsg,
  getPescadoMsg,
  getPolloMsg,
  getVacaMsg,
} = require("./functions.js");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MySQLAdapter = require("@bot-whatsapp/database/mysql");
const { handleUserInput } = require("./carnave.js");

let STATE_APP = {};
let parcial = 0;
let productoBuscado = { name: "", price: 0 };

/**
 * Declaramos las conexiones de MySQL
 */
/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */

const flowPreguntaRandom = addKeyword(["preguntar otra cosa"]).addAnswer(
  "Deje su pregunta:",
  { capture: true },
  async (ctx, { fallBack, flowDynamic }) => {
    let input = ctx.body;
    let response = await handleUserInput(input);
    console.log(response);
    await flowDynamic({
      body: response,
      buttons: [{ body: "preguntar otra cosa" }, { body: "ir a comprar" }, {body: "ir a pagar"}],
    });
  }
);

const flowCerdo = addKeyword("CERDO")
  .addAnswer(
    [
      "a continuacion indica el nombre del producto que le interesa:",
      getCerdoMsg(),
    ],
    {
      capture: true,
      sensitive: true,
    },
    async (ctx, { fallBack, flowDynamic }) => {
      let productos = getCerdo();
      productoBuscado = productos.find(
        (e) => e.name.toLowerCase() == ctx.body.toLowerCase()
      );
      if (!productoBuscado) {
        return fallBack(
          "No encontre el nombre del producto intenta nuevamente"
        );
      }
      return flowDynamic([
        {
          body: `Genial! a continuacion indica cuantos kgs de ${productoBuscado.name} quiere`,
        },
      ]);
    }
  )
  .addAnswer(
    " solo caracteres numericos!:",
    { capture: true },
    (ctx, { fallBack, flowDynamic }) => {
      let num = Number(ctx.body);
      if (isNaN(num)) return fallBack();
      parcial = productoBuscado.price * num;
      STATE_APP[ctx.from].total += parcial;
      return flowDynamic(
        `Genial! tu precio por este producto es ${parcial}, si desea continuar comprando escriba *continuar*, si quiere ir a pagar escriba *pagar*`
      );
    }
  );

const flowVaca = addKeyword(["VACA"])
  .addAnswer(
    [
      "a continuacion indica el nombre del producto que le interesa:",
      getVacaMsg(),
    ],
    {
      capture: true,
      sensitive: true,
    },
    async (ctx, { fallBack, flowDynamic }) => {
      let productos = getVaca();
      productoBuscado = productos.find(
        (e) => e.name.toLowerCase() == ctx.body.toLowerCase()
      );
      if (!productoBuscado) {
        return fallBack(
          "No encontre el nombre del producto intenta nuevamente"
        );
      }
      return flowDynamic([
        {
          body: `Genial! a continuacion indica cuantos kgs de ${productoBuscado.name} quiere`,
        },
      ]);
    }
  )
  .addAnswer(
    " solo caracteres numericos!:",
    { capture: true },
    (ctx, { fallBack, flowDynamic }) => {
      let num = Number(ctx.body);
      if (isNaN(num)) return fallBack();
      parcial = productoBuscado.price * num;
      STATE_APP[ctx.from].total += parcial;
      return flowDynamic(
        `Genial! tu precio por este producto es ${parcial}, si desea continuar comprando escriba *continuar*, si quiere ir a pagar escriba *pagar*`
      );
    }
  );

const flowPollo = addKeyword(["POLLO"])
  .addAnswer(
    [
      "a continuacion indica el nombre del producto que le interesa:",
      getPolloMsg(),
    ],
    {
      capture: true,
      sensitive: true,
    },
    async (ctx, { fallBack, flowDynamic }) => {
      let productos = getPollo();
      productoBuscado = productos.find(
        (e) => e.name.toLowerCase() == ctx.body.toLowerCase()
      );
      if (!productoBuscado) {
        return fallBack(
          "No encontre el nombre del producto intenta nuevamente"
        );
      }
      return flowDynamic([
        {
          body: `Genial! a continuacion indica cuantos kgs de ${productoBuscado.name} quiere`,
        },
      ]);
    }
  )
  .addAnswer(
    " solo caracteres numericos!:",
    { capture: true },
    (ctx, { fallBack, flowDynamic }) => {
      let num = Number(ctx.body);
      if (isNaN(num)) return fallBack();
      parcial = productoBuscado.price * num;
      STATE_APP[ctx.from].total += parcial;
      return flowDynamic(
        `Genial! tu precio por este producto es ${parcial}, si desea continuar comprando escriba *continuar*, si quiere ir a pagar escriba *pagar*`
      );
    }
  );

const flowPescado = addKeyword(["PESCADO"])
  .addAnswer(
    [
      "a continuacion indica el nombre del producto que le interesa:",
      getPescadoMsg(),
    ],
    {
      capture: true,
    },
    async (ctx, { fallBack, flowDynamic }) => {
      let productos = getPescado();
      productoBuscado = productos.find(
        (e) => e.name.toLowerCase() == ctx.body.toLowerCase()
      );
      if (!productoBuscado) {
        return fallBack(
          "No encontre el nombre del producto intenta nuevamente"
        );
      }
      return flowDynamic([
        {
          body: `Genial! a continuacion indica cuantos kgs de ${productoBuscado.name} quiere`,
        },
      ]);
    }
  )
  .addAnswer(
    " solo caracteres numericos!:",
    { capture: true, buttons: [{ body: "preguntar otra cosa" }] },
    (ctx, { fallBack, flowDynamic }) => {
      let num = Number(ctx.body);
      if (isNaN(num)) return fallBack();
      parcial = productoBuscado.price * num;
      STATE_APP[ctx.from].total += parcial;
      return flowDynamic(
        `Genial! tu precio por este producto es ${parcial}, si desea continuar comprando escriba *continuar*, si quiere ir a pagar escriba *pagar*`
      );
    }
  );

const flowOferta1 = addKeyword(["Pata muslo"]).addAnswer(
  "a continuacion indica cuantas promociones quiere, solo caracteres numericos!:",
  { capture: true },
  (ctx, { fallBack, flowDynamic }) => {
    let num = Number(ctx.body);
    if (isNaN(num)) return fallBack();
    parcial = 1290 * num;
    STATE_APP[ctx.from].total += parcial;
    return flowDynamic(
      `Genial! tu precio por este producto es ${parcial}, si desea continuar comprando escriba *continuar*, si quiere ir a pagar escriba *pagar*`
    );
  }
);

const flowOferta2 = addKeyword(["8 medallones vacunos"]).addAnswer(
  [
    "a continuacion indica cuantas promociones quiere, solo caracteres numericos!:",
  ],
  { capture: true },
  async (ctx, { fallBack, flowDynamic }) => {
    let num = Number(ctx.body);
    if (isNaN(num)) return fallBack();
    parcial = 849 * num;
    STATE_APP[ctx.from].total += parcial;

    return flowDynamic(
      `Genial! tu precio por este producto es ${parcial}, si desea continuar comprando escriba *continuar*, si quiere ir a pagar escriba *pagar*`
    );
  }
);

const flowOferta3 = addKeyword(["Bondiola"]).addAnswer(
  "a continuacion indica cuantas promociones quiere, solo caracteres numericos!:",
  { capture: true },
  (ctx, { fallBack, flowDynamic }) => {
    let num = Number(ctx.body);
    if (isNaN(num)) return fallBack();
    parcial = 1399 * num;
    STATE_APP[ctx.from].total += parcial;
    return flowDynamic(
      `Genial! tu precio por este producto es ${parcial}, si desea continuar comprando escriba *continuar*, si quiere ir a pagar escriba *pagar*`
    );
  }
);

const flowOfertas = addKeyword(["pedir oferta", "oferta"]).addAnswer(
  "selecciona el nombre de la oferta que te interesa:",
  {
    buttons: [
      { body: "Pata muslo" },
      { body: "8 medallones vacunos" },
      { body: "bondiola" },
    ],
  },
  null,
  [flowOferta1, flowOferta2, flowOferta3]
);

const flowListado = addKeyword(["listado"]).addAnswer(
  [
    "A continuacion escriba que producto le interesa? *Cerdo*, *Pollo*, *Vaca* o *Pescado*",
  ],
  { capture: true },
  null
);

const flowEfectivo = addKeyword(["efectivo"]).addAnswer(
  "Lo espero con los billetes!😃"
);
const flowOnline = addKeyword(["online"]).addAnswer(
  `Espero su comprobante! `,
  null,
  async (ctx, { flowDynamic }) => {
    flowDynamic(
      `El monto es:$${
        STATE_APP[ctx.from].total
      } , este es el link https://mpago.la/16AGQBt`
    );
  }
);

const flowPago = addKeyword(["pago", "pagar", "ir a pagar"])
  .addAnswer(["Tu total es:"], null, async (ctx, { flowDynamic }) => {
    console.log(STATE_APP, ctx);
    await flowDynamic(`$ ${STATE_APP[ctx.from].total}`);
  })
  .addAnswer(
    `por que medio quiere pagar?`,
    {
      buttons: [{ body: "efectivo" }, { body: "online" }],
    },
    { delay: 2000 },
    [flowEfectivo, flowOnline]
  );

const flowContinuar = addKeyword(["continuar", "ir a comprar"])
  .addAnswer("🙌 Seleccione que quiere ver:")
  .addAnswer(
    "Si desea comprar una de las ofertas escriba *oferta*\nPara solicitar el listado de precios escriba : *Listado*",
    { buttons: [{ body: "preguntar otra cosa" }] }
  );

const flowPrincipal = addKeyword(["hola", "ole", "alo"])
  .addAnswer("🙌 Hola bienvenido a *Carnave*")
  .addAnswer(["te dejo nuestras ofertas!", getOfertas()])
  .addAnswer(
    "Si desea comprar una de las ofertas escriba *oferta*\nPara solicitar el listado de precios escriba: *Listado*",
    { buttons: [{ body: "preguntar otra cosa" }] },
    (ctx) => {
      STATE_APP[ctx.from] = { ...STATE_APP[ctx.from], total: 0 };
    },
    [flowListado, flowOfertas, flowPreguntaRandom]
  );

const main = async () => {
  const adapterDB = new MySQLAdapter({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    database: MYSQL_DB_NAME,
    password: MYSQL_DB_PASSWORD,
    port: MYSQL_DB_PORT,
  });
  const adapterFlow = createFlow([
    flowPrincipal,
    flowContinuar,
    flowPago,
    flowCerdo,
    flowListado,
    flowOfertas,
    flowPescado,
    flowPollo,
    flowVaca,
    flowPreguntaRandom,
  ]);
  const adapterProvider = createProvider(BaileysProvider);
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
};

main();
