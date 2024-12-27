const jwt = require('jsonwebtoken')

const verification = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'token not present', success: false })
    }

    const token = authHeader.split(' ')[1]

    const decode = jwt.sign(token, process.env.SECRET_KEY)
    req.user = decode
    next()
  } catch (error) {
    return res.status(401).json({ message: 'unauthorized', success: false })
  }
}

module.exports = verification
