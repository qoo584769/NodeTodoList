const {
  GetUser,
  CreateUser,
  UpdateUser,
  DeleteUser,
} = require('../repository/connection_db');
const HttpMethod = require('../HttpFun');
const { verifyToken } = require('../model/verification');
// node js 內建加密模組
const crypto = require('crypto');
// jwt token產生
const jwt = require('jsonwebtoken');

// 建立帳號的時間函式
const onTime = () => {
  const date = new Date();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const hh = date.getHours();
  const mi = date.getMinutes();
  const ss = date.getSeconds();

  return [
    date.getFullYear(),
    '-' + (mm > 9 ? '' : '0') + mm,
    '-' + (dd > 9 ? '' : '0') + dd,
    ' ' + (hh > 9 ? '' : '0') + hh,
    ':' + (mi > 9 ? '' : '0') + mi,
    ':' + (ss > 9 ? '' : '0') + ss,
  ].join('');
};

// 驗證信箱格式
function checkEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const result = re.test(email);

  return result;
}

// 密碼加密
function hashPassword(password) {
  let hash = crypto.createHash('sha1');
  hash.update(password);
  const newPassword = hash.digest('hex');
  return newPassword;
}

// 註冊會員
function postRegister(req, res, next, memberData) {
  const { name, email, password } = memberData;
  // 呼叫加密函示
  const hashedPassword = hashPassword(password);

  const data = [name, email, hashedPassword, onTime()];

  // 呼叫驗證email函式
  const check = checkEmail(email);

  // 信箱格式錯誤回傳註冊失敗
  if (check === false) {
    HttpMethod(res, 404, 'false', data, '請輸入正確email格式');
    return;
  }

  // 格式正確才呼叫建立帳號函式
  CreateUser(data).then(
    (response) => {
      // HttpMethod(res, 200, 'success', data, '註冊成功');
      HttpMethod(res, 200, 'success', data, response.registerMember);
    },
    (err) => {
      HttpMethod(res, 404, 'false', data, err);
    }
  );
}

// 登入會員 包含給token
function login(req, res, next, memberData) {
  try {
    const getData = {
      email: memberData.email,
      password: hashPassword(memberData.password),
    };
    GetUser(getData).then(
      (response) => {
        if (response !== undefined && response.rowCount !== 0) {
          // 登入成功給token
          const token = jwt.sign(
            {
              // 加密方式
              algorithm: 'HS256',
              // 多久之後到期 60一分鐘到期 60*60一小時 也可以不用exp直接在secret後面加上{ expiresIn: '1h' }
              exp: Math.floor(Date.now() / 1000) + 60 * 60,
              data: response.rows[0].id,
            },
            // 給jwt一個字串當作加密編碼參考 需要隱藏起來 否則會有被反推的機會
            // 驗證的時候要用一樣的字串去解 不然會算不出原本的資料
            'secret'
          );
          res.setHeader('token', token);
          HttpMethod(res, 200, 'success', response.rows[0].name, '登入成功');
        } else {
          HttpMethod(res, 404, 'false', memberData.name, '登入失敗');
        }
      },
      (error) => {
        console.log(error);
      }
    );
  } catch (err) {
    HttpMethod(res, 404, 'false', memberData.name, '登入失敗');
  } finally {
    // res.end();
  }
}

// 更新會員資料
function patchUpdate(req, res, next, memberData) {
  // 取得req裡面的標頭資料
  const token = req.headers['token'];

  // 確認token有取得
  if (token === null) {
    HttpMethod(res, 404, 'false', token, '請輸入token');
  } else if (token !== null) {
    verifyToken(token).then((verify_res) => {
      if (verify_res === false) {
        HttpMethod(res, 404, 'false', verify_res, 'token錯誤,請重新登入');
      } else {
        // const hashedPassword = hashPassword(memberData.password);
        const updateData = {
          name: memberData.name,
          email: memberData.email,
          password: hashPassword(memberData.password),
          update_date: onTime(),
        };
        // console.log(memberData);
        UpdateUser(verify_res, updateData).then((update_res) => {
          HttpMethod(res, 200, 'success', update_res, update_res);
        });
      }
    });
  }
}

// 刪除會員資料
function postDelete(req, res, next, memberData) {
  // 取得req裡面的標頭資料
  const token = req.headers['token'];

  // 確認token有取得
  if (token === null) {
    HttpMethod(res, 404, 'false', token, '請輸入token');
  } else if (token !== null) {
    verifyToken(token).then((verify_res) => {
      if (verify_res === false) {
        HttpMethod(res, 404, 'false', verify_res, 'token錯誤,請重新登入');
      } else {
        // const hashedPassword = hashPassword(memberData.password);
        const deleteData = {
          name: memberData.name,
          email: memberData.email,
          password: hashPassword(memberData.password),
          update_date: onTime(),
        };
        // console.log(memberData);
        DeleteUser(verify_res, deleteData).then((delete_res) => {
          HttpMethod(res, 200, 'success', delete_res, delete_res);
        });
      }
    });
  }
}
module.exports = { postRegister, login, patchUpdate,postDelete };
