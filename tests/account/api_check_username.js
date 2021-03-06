const request = require('supertest');
const proxy = require('../helper');
const router = require('../../controllers/account');

proxy.use(router);

describe('GET /account/check_username', () => {

  const check_data = {
    userName: 'user3'
  };

  it('returns USERNAME_EXIST if userName already exists', (done) => {
    request(proxy)
      .get('/account/check_username')
      .query(check_data)
      .expect((res) => {
        if (res.body.code !== -1)
          throw new Error();
      })
      .expect(200, done);
  });

});
