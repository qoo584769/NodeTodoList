const jwt = require('jsonwebtoken');

// 驗證token是否到期
function verifyToken(token) {
  let result = '';

  //   取得現在時間 單位為秒
  const time = Math.floor(Date.now() / 1000);

  return new Promise((resolve, reject) => {
    //   使用jwt函式判斷token是否過期
    if (token) {
      // secret字串要跟token加密的字串一樣
      jwt.verify(token, 'secret', (error, decoded) => {
        //   console.log(decoded);
        if (error) {
          result = false;
          resolve(result);
        } else if (decoded.exp <= time) {
          result = false;
          resolve(result);
        } else {
          result = decoded.data;
          resolve(result);
        }
      });
    }
  });
}

module.exports = { verifyToken };
