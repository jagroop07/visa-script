const adminModel = require('../models/admin.model')

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if ((!email, !password)) {
      return res
        .status(404)
        .json({ message: 'all fields are required', success: false })
    }

    const admin = await adminModel.findOne({ email }).lean()

    if(!admin){
        return res.status(404).json({message: "admin not found", success: false})
    }

    if(admin.password != password){
        return res.status(401).json({message: "wrong credentials", success: false})
    }

    return res.status(200).json({message: "successfully login", success: true})
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = login
