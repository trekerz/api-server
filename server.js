const http = require('http')
const config = require('./config')

const server = http.createServer((req, res) => {
  const url = req.url
  for (const key in config) {
    if (url.indexOf(key) !== -1) {
      const info = config[key].target.split(':')
      const opt = {
        protocol: info[0] + ':',
        hostname: info[1].slice(2),
        port: info[2] || 80,
        path: url.replace(new RegExp(key, 'g'), ''),
        method: req.method,
        headers: req.headers
      }
      console.log(opt)
      proxy(opt, res, req)
      return
    }
  }
})

function proxy(opt, res, req) {
  const proxyReq = http.request(opt, proxyRes => {
    proxyRes.on('data', chunk => {
      console.log(chunk.toString('utf-8'))
      res.write(chunk, 'binary')
    })

    proxyRes.on('end', () => {
      res.end()
    })

    res.writeHead(proxyRes.statusCode, proxyRes.headers)
  })

  req.on('data', chunk => {
    console.log('in request length:', chunk.length)
    proxyReq.write(chunk, 'binary')
  })
  req.on('end', () => {
    proxyReq.end()
  })
}

server.listen(4000)
console.log('server is listen on 4000')
