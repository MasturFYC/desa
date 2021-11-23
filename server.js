const { createServer: https } = require('http')
//var fs = require('fs');
const { URL } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });

const port = parseInt(process.env.PORT,10) || 3000;
const handle = app.getRequestHandler();

/*
const urlEndpoint = 'https://ik.imagekit.io/at4uyufqd9s';
const publicKey = 'public_s/7hMS5caDc8ei20lSX8qSVKghE=';
const privateKey = 'private_f1ov4Rav4pIqAs+Tny2jZ4eF8LI=';

const imagekit = new ImageKit({
  urlEndpoint: urlEndpoint,
  publicKey: publicKey,
  privateKey: privateKey,
});

*/
// Multi-process to utilize all CPU cores.
/*
if (!dev && cluster.isMaster) {
  console.log(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {
*/

// var options = {
//     key: fs.readFileSync('localhost.key'),
//     cert: fs.readFileSync('localhost.crt'),
//     pem: fs.readFileSync('RootCA.pem'),
//     ca: [fs.readFileSync('RootCA.crt')]
// };


// const nextApp = next({ dir: '.', dev });
app.prepare().then(() => {
  https((req, res) => {
  //https(options, (req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const baseUrl = req.protocol + '://' + req.headers.host + '/';
    const parsedUrl = new URL(req.url, baseUrl); //, true)
    const { pathname, query } = parsedUrl


    handle(req, res, pathname); // parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})