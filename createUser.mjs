import bcrypt from 'bcrypt'
import getDB from './DB/DB'

(async () => {
  if (process.argv.length > 3) {
    var db = await getDB()
    let user = {
      email: process.argv[2],
      hashedPassword: bcrypt.hashSync(process.argv[3], 8),
      role: process.argv[4]
    }
    let existing = await db.findUser(user.email)
    if (existing) {
      console.error('user with email ' + user.email + ' already exists')
      process.exit(1)
    }
    await db.createUser(user)
  } else {
    console.log('Usage: node createUser email password role')
    process.exit(1)
  }
})()
