const { Client } = require('pg');
const dbClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
dbClient.connect(err=>{
  if(err){
    console.log('pg連線失敗');
    console.log(err);
  }else{
    console.log('pg連線成功');
  }
});

async function DbClient() {
  try {
    const query = `SELECT * from member_info`;
    const result = await dbClient.query(query);
    console.log(result);
  } catch (error) {
    console.log(error);
  } finally {
  }
}

// 取得會員資料
async function GetUser(MemberData) {
  try {
    let result = {};
    return await new Promise((resolve, reject) => {
      const getQuery = `select * from member_info where email = $1 and password = $2;`;
      const value = [MemberData.email, MemberData.password];
      dbClient.query(getQuery, [MemberData.email, MemberData.password], (get_err, get_res) => {
        if (get_err) {
          result.status = '登入失敗';
          result.err = '伺服器錯誤，請稍後再試';
          reject(result);
          return;
        }
        resolve(get_res);
      });      
    });
  } catch (error) {}
  finally{
  }
}

// 建立會員
async function CreateUser(MemberData) {
  try {
    let result = {};
    return new Promise((resolve, reject) => {
      const getQuery = `select * from member_info where email = $1`;
      const email = MemberData[1];
      dbClient.query(getQuery, [email], (get_err, get_res) => {
        // 伺服器端錯誤
        if (get_err) {
          result.status = '註冊失敗';
          result.err = '伺服器錯誤';
          reject(result);
          return;
        }
        // 判斷重複email
        if (get_res.rowCount >= 1) {
          result.status = '註冊失敗。';
          result.err = '已有重複的Email。';
          reject(result);
          return;
        }
        // 沒有重複信箱才建立帳號
        else {
          const insertQuery = `insert into member_info (name,email,password,create_date) values ($1,$2,$3,$4)`;
          // 參數是一個陣列 才能進行資料庫搜尋
          dbClient.query(insertQuery, MemberData, (err, res) => {
            if (err) {
              result.status = '註冊失敗';
              result.err = '伺服器錯誤';
              reject(result);
              return;
            }
            result.status = '註冊成功。';
            result.registerMember = MemberData;
            resolve(result);
          });
        }
      });
    });
  } catch (error) {
  } finally {
  }
}

// 編輯會員資料
async function UpdateUser(id, MemberData) {
  try {
    let result = {};
    return await new Promise((resolve, reject) => {
      const updateQuery = `update member_info set name = $1, email = $2, password = $3 where id = $4;`;
      const params = [MemberData.name,MemberData.email,MemberData.password,id];
      dbClient.query(updateQuery,params,(update_err,update_res)=>{
        if(update_err){
          console.log('update_err',update_err);
          result.status = '會員資料編輯失敗';
          result.err = '伺服器錯誤,請稍後再試';
          reject(result);
          return
        }
        console.log('update_res ',update_res);
        result.status = '會員資料編輯成功';
        result.data = MemberData;
        resolve(result);
      });
    });
  } catch (error) {
    console.log(error);
  }finally{
  }
}

// 刪除會員
async function DeleteUser(id,MemberData) {
  try {
    let result = {};
    return await new Promise((resolve, reject) => {
      const deleteQuery = `delete from member_info where id = $1;`;
      const params = [id];
      dbClient.query(deleteQuery,params,(delete_err,delete_res)=>{
        if(delete_err){
          console.log('delete_err',delete_err);
          result.status = '會員資料刪除失敗';
          result.err = '伺服器錯誤,請稍後再試';
          reject(result);
          return
        }
        console.log('delete_res ',delete_res);
        result.status = '會員資料刪除成功';
        result.data = MemberData;
        resolve(result);
      });
    });
  } catch (error) {
    console.log(error);
  }finally{
  }
}

module.exports = { DbClient, GetUser, CreateUser,UpdateUser,DeleteUser };
