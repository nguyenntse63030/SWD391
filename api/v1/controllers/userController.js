const mongoose = require('mongoose')
const User = mongoose.model('User')
const responseStatus = require('../../../configs/responseStatus')
const common = require('../../common')
const jwt = require('jsonwebtoken')
const config = require('../../../config')

async function getUserByCode(code) {
    let user = await User.findOne({ code: code })   //Tìm User theo code trong database
    if (!user) {
        throw responseStatus.Code400({ errorMessage: responseStatus.USER_NOT_FOUND })
    }

    return responseStatus.Code200({ user: user })
}

async function updateUser(id, data) {
    let user = await User.findById(id)   //Tìm hết User theo code trong database
    if (!user) {
        throw responseStatus.Code400({ errorMessage: responseStatus.USER_NOT_FOUND })
    } else {
        let userCheckPhone = await User.findOne({ phone: data.phone, _id: { $ne: user._id } })
        if (userCheckPhone) {
            throw responseStatus.Code400({ errorMessage: responseStatus.PHONE_EXISTED })
        }
    }

    user.name = data.name || user.name
    user.dateOfBirth = data.dateOfBirth || user.dateOfBirth
    user.gender = data.gender || user.gender
    user.role = data.role || user.role
    // user.phone = data.phone || user.phone
    // user.email = data.email || user.email
    user.address = data.address || user.address
    user.note = data.note || user.note

    await user.save()       //Lưu user xuống database

    return responseStatus.Code200({ message: responseStatus.UPDATE_USER_SUCCESS })
}

async function deleteUserByCode(code) {
    let user = await User.findOne({ code: code })   //Tìm hết User theo code trong database
    if (!user) {
        throw responseStatus.Code400({ errorMessage: responseStatus.USER_NOT_FOUND })
    }

    await User.remove({ code: user.code })    //Delete user theo code truyền vào
    return responseStatus.Code200({ message: responseStatus.DELETE_USER_SUCCESS })
}

async function getUserByRole(role) {
    let listUser = await User.find({ role: role }).populate('apartment')   //Tìm hết User theo role trong database
    return responseStatus.Code200({ listUser: listUser })
}

async function changeAvatar(userCode, photoURL) {
    let user = await User.findOne({ code: userCode })
    if (!user) {
        throw responseStatus.Code400({ errorMessage: responseStatus.USER_NOT_FOUND })
    }
    user.photoURL = photoURL
    await user.save()
    delete user.password
    return responseStatus.Code200({ message: responseStatus.CHANGE_AVATAR_SUCCESSFULLY, user: user })
}

async function createUser(data) {
    let user = await User.findOne({ phone: data.phone })   //Tìm trong database theo sdt

    if (user) {
        //Nếu người dùng đã tồn tại
        //Thống báo về phía client một message
        throw responseStatus.Code400({ errorMessage: responseStatus.PHONE_EXISTED })
    }

    data.email = data.email.toLowerCase().trim()

    user = await User.findOne({ email: data.email })
    if (user) {
        throw responseStatus.Code400({ errorMessage: responseStatus.EMAIL_EXISTED })
    }

    //Đổ data vào User
    user = new User()
    user.phone = data.phone || ''
    user.email = data.email || ''
    user.dateOfBirth = data.dateOfBirth || ''
    user.gender = data.gender || ''
    user.role = data.role || ''
    user.name = data.name || ''
    user.address = data.address || ''

    let userCode = ''
    // User Code 
    user.name.split(' ').forEach(function (element) {
        if (element.match(/[a-z]/i)) {
            let str = common.changeAlias(element).toUpperCase()
            userCode += str[0]
        }
    })
    userCode += '-' + Date.now().toString().slice(9)
    user.code = userCode

    user = await user.save()       //Lưu user xuống database

    return responseStatus.Code200({ message: responseStatus.CREATE_USER_SUCCESS, user: user })
}

const signUpForSocial = async function (newUser) {
    try {
        // User Code 
        userCode = ''
        newUser.name.split(' ').forEach(function (element) {
            if (element.match(/[a-z]/i)) {
                let str = common.changeAlias(element).toUpperCase()
                userCode += str[0]
            }
        })
        userCode += '-' + Date.now().toString().slice(9)
        newUser.code = userCode
        let user = new User(newUser)
        await user.save()
        let token = jwt.sign({ id: user._id, phone: user.phone, name: user.name, role: user.role, loggedInTimestamp: Date.now() }, config.secret, {
            expiresIn: config.tokenExpire
        })
        return responseStatus.Code200({ user: user, token: token })
    } catch (error) {
        return error;
    }
}

const depositAccount = async function (userId, data) {
    let customer = await User.findById(userId)
    if (!customer) {
        throw responseStatus.Code400({ errorMessage: USER_NOT_FOUND })
    }

    customer.account += Number(data)
    customer = await customer.save()
    let money = common.parseNumberToMoney(Number(data))
    let totalMoney = common.parseNumberToMoney(customer.account)
    return responseStatus.Code200({
        message: 'Bạn đã nạp ' + money + ' VND vào tài khoản thành công. Tài khoản hiện tại của bạn có ' + totalMoney + ' VND',
        newAccount: customer.account
    })
}


module.exports = {
    createUser,
    getUserByRole,
    deleteUserByCode,
    updateUser,
    getUserByCode,
    changeAvatar,
    signUpForSocial,
    depositAccount,
}