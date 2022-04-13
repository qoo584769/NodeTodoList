const http = require('http');
const { v4: uuidv4 } = require('uuid');
const HttpMethod = require('./HttpFun');
const {
  InsertMany,
  // FindMany,
  UpdateOne,
  DeleteOne,
  DeleteMany,
} = require('./repository/mongodb');
const { DbClient } = require('./repository/connection_db');
const { postRegister,login,patchUpdate,postDelete } = require('./controller/momber_controller');

let todos = [];

const RequestListen = (req, res, next) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  // -------------------------------------------------
  // 取得會員
  if (req.url.startsWith('/getuser')) {
    switch (req.method) {
      case 'GET':
        DbClient();
        break;

      default:
        break;
    }
  }
  // 註冊會員
  else if (req.url.startsWith('/signup')) {
    switch (req.method) {
      case 'POST':
        req.on('end', () => {
          const data = JSON.parse(body);
          // 呼叫控制器註冊會員函式
          postRegister(req, res, next, data);
        });
        break;

      default:
        break;
    }
  }
  // 會員登入
  else if (req.url.startsWith('/login')) {
    req.on('end', () => {
      const data = JSON.parse(body);
      login(req, res, next,data);
    });
  }
  // 會員編輯
  else if(req.url.startsWith('/update')){
    req.on('end',()=>{
      const data = JSON.parse(body);
      patchUpdate(req,res,next,data);
    });
  }
  // 會員刪除
  else if(req.url.startsWith('/delete')){
    req.on('end',()=>{
      const data = JSON.parse(body);
      postDelete(req,res,next,data);
    });
  }


  // -------------------------------------------------
  // 路由名稱正確
  else if (req.url.startsWith('/todos/') || req.url == '/todos') {
    switch (req.method) {
      // -------------------------------------------------
      // GET 取得全部代辦事項
      case 'GET':
        // todos存在記憶體 伺服器重啟會不見 造成資料庫有資料可是卻無法更新刪除
        const { MongoClient } = require('mongodb');
        const uri = process.env.MONGO_DB_CONNECTING_STRING;
        const client = new MongoClient(uri);

        async function FindMany(res, HttpCode, status, message) {
          try {
            await client.connect();

            const database = client.db('todolist');

            const todoss = database.collection('todos');

            const query = {};

            const options = {
              sort: { title: 1 },

              projection: { _id: 0 },
            };

            const cursor = await todoss.find(query, options).toArray();

            HttpMethod(res, HttpCode, status, cursor, message);
            todos = cursor;
          } finally {
            await client.close();
          }
        }

        // 從資料庫取得資料
        FindMany(res, 200, 'success', '成功取得清單');
        // pg_db();
        break;

      // -------------------------------------------------
      // POST 新增代辦事項  格式為{data:[{'title':'資料1'},{'title':'資料2'}]}
      case 'POST':
        req.on('end', () => {
          try {
            const data = JSON.parse(body).data;
            const NewData = [];

            data.forEach((val, ind) => {
              if (val.title !== undefined) {
                const todo = {
                  id: uuidv4(),
                  title: val.title,
                  deleted: false,
                };
                NewData.push(todo);
                return;
              }
              throw new Error(`新增失敗,第 ${ind + 1} 筆Key值不是title`);
            });

            todos = todos.concat(NewData);

            // 新增資料到資料庫
            InsertMany(
              res,
              200,
              'success',
              todos,
              `新增 ${NewData.length} 筆資料成功`
            );
          } catch (err) {
            if (err instanceof SyntaxError) {
              HttpMethod(res, 404, 'false', todos, '非JSON格式');
              return;
            }
            HttpMethod(res, 404, 'false', todos, err.message);
          } finally {
          }
        });
        break;

      // -------------------------------------------------
      // PATCH 更改某比代辦事項

      case 'PATCH':
        req.on('end', () => {
          try {
            const title = JSON.parse(body).title;
            const id = req.url.split('/').pop();
            const index = todos.findIndex((ind) => ind.id == id);
            if (title == undefined) {
              HttpMethod(res, 404, 'false', todos, '鍵值 title 未定義');
              return;
            } else if (index == -1) {
              HttpMethod(res, 404, 'false', todos, '找無此筆資料');
              return;
            }

            todos[index].title = title;

            // 更新一筆資料到資料庫
            UpdateOne(
              res,
              200,
              'success',
              todos,
              `已更新 id : ${id} 資料`,
              id,
              title
            );
          } catch {
            HttpMethod(res, 404, 'false', todos, '非JSON格式');
          }
        });
        break;

      // -------------------------------------------------
      // DELETE 刪除單筆/全部代辦事項
      case 'DELETE':
        const id = req.url.split('/').pop();
        if (id !== 'todos') {
          const index = todos.findIndex((ind) => ind.id == id);

          if (index == -1) {
            HttpMethod(res, 404, 'false', todos, '找無此筆資料');
            return;
          }

          todos.splice(index, 1);

          // 從資料庫刪除一筆資料
          DeleteOne(res, 200, 'success', todos, `已刪除 id : ${id} 資料`, id);
        } else {
          todos.length = 0;

          // 刪除資料庫全部資料
          DeleteMany(res, 200, 'success', todos, '已刪除全部資料');
        }
        break;

      // -------------------------------------------------
      // OPTIONS 確認跨網域是否有問題
      case 'OPTIONS':
        res.writeHeader(200, headers);
        res.end();
        break;

      default:
        break;
    }
  }
  // -------------------------------------------------
  // 路由名稱錯誤
  else {
    HttpMethod(res, 404, 'false', todos, '路由錯誤,請加上/todos路由');
  }
  // -------------------------------------------------
  // GET 取得全部代辦事項
  // if (req.url == '/todos' && req.method == 'GET') {
  //   HttpMethod(res, 200, 'success', todos, '成功取得清單');
  // }

  // // -------------------------------------------------
  // // POST 新增代辦事項
  // else if (req.url == '/todos' && req.method == 'POST') {
  //   req.on('end', () => {
  //     try {
  //       const title = JSON.parse(body).title;
  //       if (title == undefined) {
  //         HttpMethod(res, 404, 'false', todos, 'key值 title 未定義');
  //         return;
  //       }

  //       const todo = {
  //         title: title,
  //         id: uuidv4(),
  //       };
  //       todos.push(todo);
  //       HttpMethod(res, 200, 'success', todos, '新增成功');
  //     } catch {
  //       HttpMethod(res, 404, 'false', todos, '非JSON格式');
  //     } finally {
  //     }
  //   });
  // }

  // // -------------------------------------------------
  // // PATCH 更改某比代辦事項
  // else if (req.url.startsWith('/todos/') && req.method == 'PATCH') {
  //   req.on('end', () => {
  //     try {
  //       const title = JSON.parse(body).title;
  //       const id = req.url.split('/').pop();
  //       const index = todos.findIndex((ind) => ind.id == id);

  //       if (title == undefined) {
  //         HttpMethod(res, 404, 'false', todos, '鍵值 title 未定義');
  //         return;
  //       } else if (index == -1) {
  //         HttpMethod(res, 404, 'false', todos, '找無此筆資料');
  //         return;
  //       }

  //       todos[index].title = title;
  //       HttpMethod(res, 200, 'success', todos, '更新成功');
  //     } catch {
  //       HttpMethod(res, 404, 'false', todos, '非JSON格式');
  //     }
  //   });
  // }

  // // -------------------------------------------------
  // // DELETE 刪除全部代辦事項
  // else if (req.url == '/todos' && req.method == 'DELETE') {
  //   todos.length = 0;
  //   HttpMethod(res, 200, 'success', todos, '已刪除全部資料');
  // }

  // // -------------------------------------------------
  // // DELETE 刪除單筆代辦事項
  // else if (req.url.startsWith('/todos/') && req.method == 'DELETE') {
  //   const id = req.url.split('/').pop();
  //   const index = todos.findIndex((ind) => ind.id == id);

  //   if (index == -1) {
  //     HttpMethod(res, 404, 'false', todos, '找無此筆資料');
  //     return;
  //   }

  //   todos.splice(index, 1);

  //   HttpMethod(res, 200, 'success', todos, '已刪除此筆資料');
  // }

  // // -------------------------------------------------
  // // OPTIONS 確認跨網域是否有問題
  // else if (req.method == 'OPTIONS') {
  //   res.writeHeader(200, headers);
  //   res.end();
  // }

  // // -------------------------------------------------
  // // 路由名稱錯誤
  // else {
  //   HttpMethod(res, 404, 'false', todos, '路由錯誤,請加上/todos路由');
  // }
};

const server = http.createServer(RequestListen);
const port = process.env.PORT || 8080;
server.listen(port);
