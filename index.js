const http = require('http');
const { v4: uuidv4 } = require('uuid');
const HttpMethod = require('./HttpFun');
const {
  InsertMany,
  FindMany,
  UpdateOne,
  DeleteOne,
  DeleteMany,
} = require('./repository/mongodb');

let todos = [];

const RequestListen = (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  // -------------------------------------------------
  // 路由名稱正確
  if (req.url.startsWith('/todos/') || req.url == '/todos') {
    switch (req.method) {
      // -------------------------------------------------
      // GET 取得全部代辦事項
      case 'GET':

        // 從資料庫取得資料
        const result =FindMany(res, 200, 'success', '成功取得清單');

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
            InsertMany(res, 200, 'success', todos, `新增 ${NewData.length} 筆資料成功`);

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
            UpdateOne(res, 200, 'success', todos, `已更新 id : ${id} 資料`,id, title);

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
          DeleteOne(res, 200, 'success', todos, `已刪除 id : ${id} 資料`,id);
          
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
