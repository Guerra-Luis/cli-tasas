#!/usr/bin/env node
import chalk from 'chalk'       // Colorear el texto de la consola
import Table from 'cli-table3'  // Generar tablas en la consola
import Conf from 'conf'         // Manejador de persistencia entre sesiones
import inquirer from 'inquirer' // Interactividad en la cli

//Inicializamos el gestor de configuracion
const config = new Conf({ projectName: 'cli-tasas' })
const baseURL = 'https://rates.dolarvzla.com'

async function getApiKey() {

  //Verifica si se posee una apiKey guardada
  let apiKey = config.get('apiKey')

  if (!apiKey) {
    console.log(chalk.yellow('⚠️  No se encontró ninguna API Key configurada.'))
    console.log(chalk.yellow('Visite https://www.dolarvzla.com/settings/api para obtener una apikey'))

    // Pide el apiKey
    const answer = await inquirer.prompt([
      {
        type: 'password',
        name: 'key',
        message: 'Introdzca el apiKey:',
        mask: '*',
        validate: (input) => input.trim() !== '' || 'La API Key no puede estar vacía'
      }
    ])

    apiKey = answer.key.trim()

    //Guardamos en local de forma segura
    config.set('apiKey', apiKey)
    console.log(chalk.green('✔ API Key guardada correctamente.\n'))
  }

  return apiKey
}

async function getBcvExchangeRates() {
  try {
    const request = await fetch(`${baseURL}/bcv/current.json`)
    const response = request.json()
    return response
  } catch (error) {
    console.error('Error al solicitar datos del BCV:', error)
  }
}

async function getUsdtExchangeRates() {
  const apiKey = await getApiKey()
  const url = `https://api.dolarvzla.com/public/usdt/exchange-rate`
  try {
    const request = await fetch(url, {
      headers: {
        'x-dolarvzla-key': apiKey,
        'Content-Type': 'application/json'
      }
    })
    const response = request.json()
    return response
  } catch (error) {
    console.error('Error al solicitar datos de USDT:', error)
  }
}

async function consultarApi() {

  try {
    console.log(chalk.green('Consultando tasas de cambio actuales...'))

    //Obtenemos los datos publicos
    const publicData = await getBcvExchangeRates()

    //Obtenemos datos limitados
    const usdtData = await getUsdtExchangeRates()

    //Crea una instancia de tabla con sus respectivos encabezados
    const table = new Table({
      head: [
        chalk.green('Tasa'),
        chalk.green('Cambio actual'),
        chalk.green('Cambio previo'),
        chalk.green('% de cambio')
      ],
    })

    //Agrega las filas de la tabla con sus datos
    table.push(
      [
        'USD_BCV',
        publicData.current.usd.toFixed(2),
        publicData.previous.usd.toFixed(2),
        publicData.changePercentage.usd.toFixed(4)
      ],
      [
        'EUR_BCV',
        publicData.current.eur.toFixed(2),
        publicData.previous.eur.toFixed(2),
        publicData.changePercentage.eur.toFixed(4)
      ],
      [
        'USDT',
        usdtData.current.buy.toFixed(2),
        usdtData.previous.buy.toFixed(2),
        usdtData.changePercentage.buy.toFixed(2),
      ]
    )

    console.log(table.toString())
  } catch (error) {
    console.error(chalk.red('Error al conectar con la API: '), error)
  }
}

consultarApi()