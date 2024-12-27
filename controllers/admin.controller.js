const adminModel = require('../models/admin.model')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if ((!email, !password)) {
      return res
        .status(404)
        .json({ message: 'all fields are required', success: false })
    }

    const admin = await adminModel.findOne({ email }).lean()

    if (!admin) {
      return res
        .status(404)
        .json({ message: 'admin not found', success: false })
    }

    if (admin.password != password) {
      return res
        .status(401)
        .json({ message: 'wrong credentials', success: false })
    }

    const token = jwt.sign({ id: admin._id }, process.env.SECRET_KEY, {
      expiresIn: '2h'
    })

    return res
      .status(200)
      .json({ message: 'successfully login', token, success: true })
  } catch (error) {
    console.log(error.message)
  }
}

//register
const register = async (req, res) => {
  const data = req.body

  await adminModel.create(data)

  return res.json({ message: 'admin is registered' })
}

module.exports = { login, register }
