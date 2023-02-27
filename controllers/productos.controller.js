const util = require('util');

const {connection} =require('../db/db.js')
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


const getProductsName = async () =>{
    return await query(`SELECT nombre FROM productos`)
    .then(results => {
      if (results.length === 0) {
        throw new Error(`No se encontró el producto "${meatType}"`);
      }else {
        let nombres = []
        for (const producto of results) {
            nombres.push(producto.nombre)
        }
        return nombres
    }
    })
    .catch(error => {
      throw error;
    });
}

 const getProducts = async(req, res) =>{
    const [products] = await query('SELECT * from productos')
    res.json(products)
}

 const getProduct = async(req, res)=>{
    const {id} = req.params
    const [product] = await query('SELECT id, name, price FROM productos WHERE id =(?)', id)
    res.json(product)
}

 const createProducts = async (req, res) =>{
    const {name, price} = req.body
    const [rows] = await query('INSERT INTO productos (name, price) VALUES (?, ?)', [name, price])
    res.send({
        id:rows.insertId,
        name,
        price
    })
}

 const editProducts = async (req, res) =>{
    const {id} = req.params
    const {name, price} = req.body
    const [editProduct] = await query('UPDATE productos SET name = IFNULL(?, name), price = IFNULL(?, price) WHERE id = ?', [name, price, id])
    if(!editProduct.affectedRows) return res.status(404).json({message: 'product not found'})
    const [product] = await query('SELECT id, name, price FROM productos WHERE id =(?)', id)
    res.status(200).json(`Se ha editado el producto ${product[0].name}`)
}

 const deleteProducts =async (req, res) =>{
    const [deleteProduct] = await query('DELETE FROM productos WHERE id = ?', [req.params.id])
    if(!deleteProduct.affectedRows) return res.status(404).json({message: 'product not found'})
    res.status(200).json(`Se ha eliminado el producto`)
}


module.exports = {
    getProductsName,


}