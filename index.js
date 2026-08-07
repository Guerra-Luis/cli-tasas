#!/usr/bin/env node
import chalk from 'chalk'         // Colorear el texto de la consola
import Table from 'cli-table3'    // Generar tablas en la consola
import Conf from 'conf'           // Manejador de persistencia entre sesiones
import inquirer from 'inquirer'   // Interactividad en la cli
import { log } from 'node:console'
import { parseArgs } from 'node:util' // Gestion de argumentos de la linea de comandos

//Inicializamos el gestor de configuracion
const config = new Conf({ projectName: 'cli-tasas' })
const baseURL = 'https://rates.dolarvzla.com'

const { values, positionals } = parseArgs({
  options: {
    help: { type: 'boolean', short: 'h' },
    date: { type: 'string', short: 'd' },
    version: { type: 'boolean', short: 'v' },

  },
  allowPositionals: false,
})

function apiKeyExpired(stored) {
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

  if (!stored || !stored.createdAt) return true
  const ageMs = Date.now() - new Date(stored.createdAt).getTime()
  return ageMs >= THREE_DAYS_MS
}

async function getApiKey() {

  //Verifica si se posee una apiKey guardada
  let stored = config.get('apiKey')

  if (!stored || !stored.value || apiKeyExpired(stored)) {

    if (apiKeyExpired(stored)) {
      console.log(chalk.yellow('⚠️  Ha expiradoNo el API Key configurada.'))
    } else {
      console.log(chalk.yellow('⚠️  No se encontró ninguna API Key configurada.'))
    }
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

    const apiKey = answer.key.trim()

    //Guardamos en local de forma segura
    config.set('apiKey', {
      value: apiKey,
      createdAt: new Date()
    })
    console.log(chalk.green('✔ API Key guardada correctamente.\n'))
  }

  return config.get('apiKey').value
}

async function getBcvExchangeRates() {
  try {
    const request = await fetch(`${baseURL}/bcv/current.json`)
    const response = await request.json()

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

    if (request.status === 401) {
      config.delete('apiKey')
      throw new Error('La API key ha expirado o es inválida.')
    }

    const response = await request.json()
    return response
  } catch (error) {
    console.error('Error al solicitar datos de USDT:', error)
  }
}

async function getBcvExchangeRatesByDate(date) {
  try {
    const dateNumbers = date.split('-').map(num => Number(num))
    const url = `${baseURL}/bcv/${dateNumbers.join('/')}.json`

    const request = await fetch(url)
    const response = request.json()

    return response
  } catch (error) {
    console.error('Error con la petision por fecha', error)
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

if (Object.keys(values).length === 0) {
  //Header
  console.log('\n┏━╸╻  ╻   ╺┳╸┏━┓┏━┓┏━┓┏━┓\n┃  ┃  ┃╺━╸ ┃ ┣━┫┗━┓┣━┫┗━┓\n┗━╸┗━╸╹    ╹ ╹ ╹┗━┛╹ ╹┗━┛\n')
  try {
    await consultarApi()

    //Ejemplo de uso
    console.log('⚠️Si deseas saber la tasa especifica de un dia utiliza el comando:\n')
    console.log('    tasas --date aaaa-mm-dd\n')
  } catch (error) {
    console.error(error)
  }
}
if (values.help) {
  // Escribir texto para el help
}
if (values.date) {
  const dataBcv = await getBcvExchangeRatesByDate(values.date)

  const table = new Table({
    head: [
      chalk.green('Fecha'),
      chalk.green('USD_BCV'),
      chalk.green('EUR_BCV'),
    ],
  })

  const [date, usd, eur] = Object.values(dataBcv)
  table.push([date, usd.toFixed(2), eur.toFixed(2)])
  console.log(table.toString())
}