'use strict';

const Promise = require('bluebird');
const User = require('../models').User;
const Item = require('../models').Item;
const Order = require('../models').Order;
const RefundText = require('../models').RefundText;

const Router = require('express').Router;
const router = Router();
const createItem = require('./services/order').createItem;
const createOrder = require('./services/order').createOrder;
const requestPay = require('./services/account').requestPay;
const requestReceive = require('./services/account').requestReceive;

router.post('/item/new', Promise.coroutine(function* (req, res) {
  console.log('in /item/new');
  console.log(req.body);
  try {
    // TODO: Fetch user from session
    // createItem(req.session.userId, req.body);    
    const id = yield createItem(1, req.body);
    // return res.json({ code: 0 });
    return res.success("newItem id: " + id);
  }
  catch (e) {
    console.error('error in /item/new: \t' + e.message);
    // return res.json({
    //   code: 1,
    //   error: 'Error inserting new item:' + e.message
    // });
    return res.fail('Error inserting new item:' + e.message);
  }
}));

const validate = (i) => {
  return typeof (i) != 'undefined';
};

router.post('/item/item_list', Promise.coroutine(function* (req, res) {
  console.log('in /item/item_list');
  console.log(req.body);
  try {
    if (validate(req.body.id)) {
      const item = yield Item.findOne({
        where: { id: req.body.id }, order: req.body.base + req.body.order
      });
      return res.success({ items: [item] });
    }
    let filter = {};
    if (validate(req.body.sellerId)) {
      filter.sellerId = req.body.sellerId;
    }
    if (validate(req.body.filter.price)) {
      filter.price = req.body.filter.price;
    }
    if (validate(req.body.filter.time)) {
      filter.createdAt = req.body.filter.time;
    }
    if (validate(req.body.filter.remain)) {
      filter.remain = req.body.filter.remain;
    }
    if (validate(req.body.filter.name)) {
      filter.name = req.body.filter.name;
    }
    return res.success({
      items: yield Item.findAll({
        where: filter,
        order: req.body.base + req.body.order,
        offset: req.body.head,
        limit: req.body.length
      })
    });
  }
  catch (e) {
    return res.fail('in /item/item_list   ' + e.message);
  }
}));

router.post('/item/update', Promise.coroutine(function* (req, res) {
  console.log('in /item/update');
  console.log(req.body);
  try {
    const item = yield Item.findOne({ where: { id: req.body.id } });
    if (!item) {
      throw new Error('Item Not Found.');
    }
    // TODO: check item owner and authentication 
    // if (item.sellerId != req.session.userId) {
    //   throw new Error('Auth Fail.');
    // }
    yield item.update(req.body);
    return res.success('Item updated.');
  }
  catch (e) {
    return res.fail('in /item/update   ' + e.message);
  }
}));

router.post('/item/delete', Promise.coroutine(function* (req, res) {
  console.log('in /item/delete');
  console.log(req.body);
  try {
    const item = yield Item.findOne({ where: { id: req.body.id } });
    if (!item) {
      throw new Error('Item Not Found.');
    }
    // TODO: check item owner and authentication
    // if (item.sellerId != req.session.userId) {
    //   throw new Error('Auth Fail.');
    // }
    yield item.destroy();
    return res.success('Item destroyed');
  }
  catch (e) {
    return res.fail('in /item/delete   ' + e.message);
  }
}));

router.post('/order/new', Promise.coroutine(function* (req, res) {
  console.log('in /order/new');
  console.log(req.body);
  try {
    createOrder(req.body.sellerId, req.body.buyerId, req.body.count, req.body.cost, req.body.items);
    // TODO: add session auth
    // createOrder(req.body.sellerId, req.session.userId, req.body.count, req.body.cost, req.body.items);
    return res.success('Order created');
  }
  catch (e) {
    return res.fail('in /order/new   ' + e.message);
  }
}));

router.post('/order/delete', Promise.coroutine(function* (req, res) {
  console.log('/order/delete');
  console.log(req.body);
  try {
    const order = yield Order.findOne({ where: { id: req.body.orderId } });
    if (!order) {
      throw new Error('Order Not Found.');
    }
    // TODO:

    yield order.destroy();
    return res.success("Order deleted");
  }
  catch (e) {
    return res.fail('in /order/delete   ' + e.message);
  }
}));

router.post('/order/update', Promise.coroutine(function* (req, res) {
  console.log('/order/update');
  console.log(req.body);
  try {
    const order = yield Order.findOne({ where: { id: req.body.orderId } });
    if (!order) {
      throw new Error('Order Not Found.');
    }
    switch (req.body.op) {
      case 'pay':
        // TODO:
        if (order.status != 0) {
          throw new Error('illegal operation');
        }
        // if (req.session.userId != order.buyerId) {
        //   throw new Error('Auth Failed.');
        // }
        // const payTrans = requestPay(order.buyerId, order.cost);
        const payTrans = 1;
        yield order.update({
          buyerTransId: payTrans,
          status: 1
        });
        break;
      case 'ship':
        if (order.status != 1) {
          throw new Error('illegal operation');
        }
        // TODO:
        if (req.session.userId != order.sellerId) {
          throw new Error('Auth Failed.');
        }
        yield order.update({
          status: 2
        });
        break;
      case 'confirm':
        if (order.status != 2) {
          throw new Error('illegal operation');
        }
        // TODO:
        if (req.session.userId != order.buyerId) {
          throw new Error('Auth Failed.');
        }
        const confirmTrans = requestReceive(order.sellerId, order.cost);
        yield order.update({
          sellerTransId: confirmTrans,
          status: 3
        });
        break;
      case 'reqRefund':
        if (order.status != 2 || order.status != 3) {
          throw new Error('illegal operation');
        }
        // TODO:
        if (req.session.userId != order.buyerId) {
          throw new Error('Auth Failed.');
        }
        if (!validate(req.body.refundReason)) {
          throw new Error('Expect refundReason');
        }
        yield order.update({
          buyerText: req.body.refundReason,
          status: 4
        });
        break;
      case 'refuseRefund':
        if (order.status != 4) {
          throw new Error('illegal operation');
        }
        // TODO:
        if (!validate(req.body.refuseReason)) {
          throw new Error('Expect refuseReason');
        }
        yield order.update({
          sellerText: req.body.refuseReason,
          status: 6
        });
        // TODO: Call B5
        break;
      case 'confirmRefund':
        if (order.status != 4) {
          throw new Error('illegal operation');
        }
        // TODO:
        const refundTrans = requestReceive(order.buyerId, order.cost);
        yield order.update({
          status: 5
        });
        break;
      default:
        return res.fail('Illegal operation.');
    }
    return res.success(order);
  }
  catch (e) {
    return res.fail('in /order/update   ' + e.message);
  }
}));

router.post('/order/order_list', Promise.coroutine(function* (req, res) {
  console.log('/order/order_list');
  console.log(req.body);
  try {
    if (validate(req.body.id)) {
      const order = yield Order.findOne({ where: { id: req.body.id } });
      return res.success({ orders: [order] });
    }
    let filter = {};
    if (validate(req.body.sellerId)) {
      filter.sellerId = req.body.sellerId;
    }
    if (validate(req.body.buyerId)) {
      filter.buyerId = req.body.buyerId;
    }
    if (validate(req.body.filter)) {
      if (validate(req.body.filter.time)) {
        filter.createdAt = req.base.filter.time;
      }
      if (validate(req.body.filter.status)) {
        filter.status = req.body.filter.status;
      }
    }
    if (validate(req.body.base)) {
      return res.success({
        items: yield Order.findAll({
          where: filter,
          order: req.body.base + ' ' + req.body.order,
          offset: req.body.head,
          limit: req.body.length
        })
      });
    }
    else {
      return res.success({
        items: yield Order.findAll({
          where: filter,
          offset: req.body.head,
          limit: req.body.length
        })
      });
    }
  }
  catch (e) {
    return res.fail('in /order/order_list   ' + require('util').inspect(e));
  }
}));

module.exports = router
