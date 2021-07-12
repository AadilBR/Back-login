const express = require('express')
const ethers = require('ethers')
const fsPromises = require('fs/promises')

const LOG_FILE = 'access-log.txt'

const logger = async (req) => {
  try {
    const date = new Date()
    const log = `${date.toUTCString()} ${req.method} "${
      req.originalUrl
    }" from ${req.ip} ${req.headers['user-agent']}\n`
    await fsPromises.appendFile(LOG_FILE, log, 'utf-8')
  } catch (e) {
    console.error(`Error: can't write in ${LOG_FILE}`)
  }
}

const readLastLog = async () => {
  try {
    const info = await fsPromises.readFile(`./${LOG_FILE}`, 'utf-8').then((result) => result.split('\n').slice(-2, -1).join())
    console.log(info.split('\n').slice(-2, -1).join())
    return info
  } catch (e) {
    console.error(e.message)
  }
}


const app = express()
const PORT = 3333
const IP_LOCAL = "127.0.0.1"

// exercice 1 
app.get('/', (req, res, next) => {
  logger(req);
  next()
}, (req, res) => {
  res.send(`Hello ${req.ip}`)
})

app.get('/john', (req, res, next) => {
  console.log(`${req.ip} connected`)
  next()
}, (req,res) => {
  res.send("Sorry we don't do post yet")
})

// exercice 3 
app.get('/info', (req, res, next) => {
  logger(req);
  next()
}, async (req, res) => {
  const info = await readLastLog()
  res.send(`Hello ${req.ip}, here's all the informations about you : \n\n ${info}`)
})

// exercice 4 
app.get('/:address', async (req, res) => {
  const account = new ethers.providers.InfuraProvider("rinkeby", process.env.INFURA_PROJECT_ID)
  const address = req.params.address
  if (ethers.utils.isAddress(address)) {
    const amount = await account.getBalance(address)
    res.send(`l'address dite "${address.slice(0, 6) + "..." + address.slice(-4)}" est en possession de ${amount / 10 ** 18} ETH`)
  } else {
    res.send(`Sorry ${address} is not an ethereum address`)
  }
})



app.listen(PORT, IP_LOCAL, () => {
  console.log(`Example app listening at http://${IP_LOCAL}:${PORT}`)
})
