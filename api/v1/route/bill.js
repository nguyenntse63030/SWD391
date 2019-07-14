const express = require('express')
const router = express.Router()
const billController = require('../controllers/billController')
const authorize = require('../middleware/authorize')

router.get('/', authorize(), async (req, res, next) => {
    try {
        let response = await billController.getAllBill()
        return res.send(response)
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).send(error)
    }
})

router.get('/room/:roomId', authorize(), async (req, res, next) => {
    try {
        let response = await billController.getBillByRoomId(req.params.roomId)
        return res.send(response)
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).send(error)
    }
})

router.get('/user/unpaid/:userId', authorize(), async (req, res, next) => {
    try {
        let response = await billController.getUnpaidBillByUserId(req.params.userId)
        return res.send(response)
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).send(error)
    }
})

router.get('/user/paid/:userId', authorize(), async (req, res, next) => {
    try {
        let response = await billController.getPaidBillByUserId(req.params.userId)
        return res.send(response)
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).send(error)
    }
})

router.get('/:code', authorize(), async (req, res, next) => {
    try {
        let response = await billController.getBillByCode(req.params.code)
        return res.send(response)
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).send(error)
    }
})

router.post('/room/:id', authorize(), async (req, res, next) => {
    try {
        const response = await billController.createBill(req.params.id, req.body, req.user.id)
        return res.send(response)
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).send(error)
    }
})

router.put('/:id', authorize(), async (req, res, next) => {
    try {
        const response = await billController.updateBill(req.params.id, req.body, req.user.id)
        return res.send(response)
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).send(error)
    }
})

router.put('/payment/:billId', authorize(), async (req, res, next) => {
    try {
        const response = await billController.paymentBill(req.user.id, req.params.billId)
        return res.send(response)
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).send(error)
    }
})

router.delete('/:id', authorize(), async (req, res, next) => {
    try {
        const response = await billController.deleteBill(req.params.id)
        return res.send(response)
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).send(error)
    }
})

module.exports = router
