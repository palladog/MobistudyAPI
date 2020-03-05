import {Docker} from 'node-docker-api'

let docker = new Docker({ socketPath: '/var/run/docker.sock' })
let image
let container

const pullImage = function (docker, image, tag) {
  return new Promise((resolve, reject) => {
    docker.image.create({}, { fromImage: image, tag: tag })
    .then((stream) => {
      stream.on('end', resolve)
      stream.on('error', reject)
    })
  })
}

const wait = async function (millis) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millis)
  })
}

const execStart = async function (exec) {
  return new Promise((resolve, reject) => {
    exec.start()
    .then((stream) => {
      stream.on('data', (info) => {
        if (info.toString().includes('ERROR')) reject(info.toString())
        else resolve()
      })
      stream.on('end', resolve)
      stream.on('error', reject)
    })
  })
}

export const ARANGOPORT = '5555'

export const startArango = async function () {
  console.log('pulling image')
  // await pullImage(docker, 'arangodb', '3.6')
  image = await docker.image.get('arangodb:3.6').status()
  console.log('creating container')
  container = await docker.container.create({
    Image: 'arangodb:3.6',
    name: 'arangodb',
    Env: [
      'ARANGO_ROOT_PASSWORD=testtest'
    ],
    HostConfig: {
      PortBindings: {
        "8529/tcp": [
          {
            HostPort: ARANGOPORT
          }
        ]
      }
    }
  })
  console.log('starting started')
  container = await container.start()
  console.log('container started')

  await wait(10000)

  console.log('executing init script')

  let creationscript = "db._createDatabase('mobistudy');\
  var users = require('@arangodb/users');\
  users.save('mobistudy', 'testpwd');\
  users.grantDatabase('mobistudy', 'mobistudy');"

  let exec = await container.exec.create({
    Cmd: [ 'arangosh', '--server.username', 'root' , '--server.password', 'testtest', '--javascript.execute-string', creationscript ],
    AttachStderr: true,
    AttachStdout: true
  })

  await execStart(exec)
  console.log('init executed')
  return
}

export const stopArango = async function () {
  await container.stop()
  await container.delete({ force: true })
  // if (image) await image.remove()
  return
}
