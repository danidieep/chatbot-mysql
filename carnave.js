const mysql = require("mysql2");
const {Configuration, OpenAIApi} = require("openai");
require("dotenv").config();
const util = require('util');
const { getProductsName } = require("./controllers/productos.controller");

const {connection} =require('./db/db.js') 
// Establece tus credenciales de API de OpenAI
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Configura el modelo y los parámetros de generación
// const model = "text-davinci-002";
// const prompt = "Hola, ¿en qué puedo ayudarte?";
// const options = {
//   maxTokens: 60,
//   temperature: 0.7,
//   n: 1,
//   stop: "\n",
// };

// Configura la conexión a la base de datos
// const dbConfig = {
//   host: "localhost",
//   user: "root",
//   password: "2808",
//   database: "carnave",
// };
// const connection = mysql.createConnection(dbConfig);

// Función para buscar en la base de datos y generar una respuesta
// function generateResponse(input) {
//   return new Promise(async (resolve, reject) => {
//     // Define las preguntas que tu bot puede responder y cómo se deben buscar en la base de datos
//     const questions = [
//       {
//         regex: /precio de la (.+)/i,
//         sql: `SELECT price FROM products WHERE name = '$1'`,
//         response: (results) =>
//           `El precio de la $1 es de ${results[0].price} dólares.`,
//       },
//       {
//         regex: /peso de la (.+)/i,
//         sql: `SELECT weight FROM products WHERE name = '$1'`,
//         response: (results) =>
//           `El peso de la $1 es de ${results[0].weight} gramos.`,
//       },
//       {
//         regex: /disponibilidad de la (.+)/i,
//         sql: `SELECT stock FROM products WHERE name = '$1'`,
//         response: (results) =>
//           `Hay ${results[0].stock} unidades disponibles de la $1.`,
//       },
//       {
//         regex: /calidad de la (.+)/i,
//         sql: `SELECT quality FROM products WHERE name = '$1'`,
//         response: (results) => `La calidad de la $1 es ${results[0].quality}.`,
//       },
//     ];

//     // Busca la pregunta correspondiente en la base de datos
//     for (const question of questions) {
//       const match = input.match(question.regex);
//       if (match !== null) {
//         const sql = question.sql.replace(/\$1/g, match[1]);
//         connection.query(sql, (error, results) => {
//           if (error) {
//             reject(error);
//           } else if (results.length === 0) {
//             reject(`No se encontró el producto "${match[1]}"`);
//           } else {
//             const response = question.response(results);
//             resolve(response);
//           }
//         });
//         return;
//       }
//     }

//     // Si no se encontró una pregunta correspondiente, genera una respuesta con GPT-3
//     const completions = await openai.completions.create({
//       engine: model,
//       prompt: prompt + "\nUsuario: " + input + "\nBot",
//     });
//     const message = completions.choices[0].text.trim();
//     resolve(message);
//   });
// }

 const query = util.promisify(connection.query).bind(connection);

// async function getPriceFromDatabase(meatType){
//   return new Promise(async(resolve, reject)=>{
//     connection.query(`SELECT precio FROM productos WHERE nombre = ?`,meatType, async (error, results) => {
//       if (error) {
//         reject(error);
//       } else if (results.length === 0) {
//         reject(`No se encontró el producto "${match[1]}"`);
//       } else {
//         console.log(results, 'soy en result de getprice')
//        return resolve`El precio de la carne de ${meatType} es ${results[0].precio}`;
//       }
//     });
//   })
// }

async function getPriceFromDatabase(meatType) {
  return await query(`SELECT precio FROM productos WHERE nombre = "${meatType}"`)
    .then(results => {
      if (results.length === 0) {
        throw new Error(`No se encontró el producto "${meatType}"`);
      }
      return `${results[0].precio}`;
    })
    .catch(error => {
      throw error;
    });
}

async function getImageFromDatabase(meatType){
  return new Promise(async(resolve, reject)=>{
    connection.query(`SELECT image FROM productos WHERE name = ${meatType}`, (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        reject(`No se encontró el producto "${match[1]}"`);
      } else {
        const response = question.response(results);
        resolve( `El precio de la ${meatType} es de ${response[0].imageUrl} dólares.`);
      }
    });
  })
}

async function getDescriptionFromDatabase(meatType){
  return new Promise(async(resolve, reject)=>{
    connection.query(`SELECT stock FROM productos WHERE name = ${meatType}`, (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        reject(`No se encontró el producto "${match[1]}"`);
      } else {
        const response = question.response(results);
        resolve( `El precio de la ${meatType} es de ${response[0].stock} dólares.`);
      }
    });
  })
}

async function generateGptResponse(input) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openaiClient = new OpenAIApi(configuration);
  const prompt = `Pregunta: ¿${input}?\nRespuesta:`;
  const completions = await openaiClient.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 150
    // n: 1,
    // stop: ["\n"]
  }); 
  console.log(completions.data.choices)
  const gptResponse = completions.data.choices[0].text;
  return gptResponse;
}

// Función para manejar la interacción con el usuario
async function handleUserInput(input) {
  try {
    const message = await generateResponse(input);
    console.log(message);
    return message; // si quieres devolver el mensaje para usarlo en otro lugar
  } catch (error) {
    console.error(error);
    return `Lo siento, no pude procesar tu solicitud en este momento.`; // mensaje de error genérico
  }
}

async function identifyMeatType(input) {
  const words = input.toLowerCase().split(" ");
  const tipos = await getProductsName();
  let tipoEncontrado = [];
  tipos.forEach((tipo) => {
    if (words.includes(tipo)) {
      tipoEncontrado.push(tipo);
    }
  });
  if(tipoEncontrado.length>1) return null
  return tipoEncontrado;
}

function generateResponse(input) {
  return new Promise(async (resolve, reject) => {
    const meatType = await identifyMeatType(input);
    let response;

    if (!meatType) {
      const gptResponse = await generateGptResponse(input);
      response = `No tengo información sobre eso, pero puedo decirte que ${gptResponse}.`;
    }

    if (input.includes("precio")) {
      const price = await getPriceFromDatabase(meatType);
      response = `El precio de la carne de ${meatType} es ${price}.`;
    } else if (input.includes("imagen")) {
      const imageUrl = getImageFromDatabase(meatType);
      response = `Aquí tienes una imagen de la carne de ${meatType}: ${imageUrl}.`;
    } else if (input.includes("descripción")) {
      const stock = getDescriptionFromDatabase(meatType);
      response = `La descripción de la carne de ${meatType} es la siguiente: ${stock}.`;
    } else {
      const gptResponse = await generateGptResponse(input);
      response = `No tengo información sobre eso, pero puedo decirte que ${gptResponse}.`;
    }

    resolve(response);
  });
}

module.exports = {
  handleUserInput,
  query
}