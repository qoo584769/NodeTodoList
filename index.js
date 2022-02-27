const http = require('http');
const { v4: uuidv4 } = require('uuid');

const todos = [
  {
    title: 'today',
    id: uuidv4(),
  },
];

const RequestListen = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  };

  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });
  // GET 取得全部代辦事項
  if (req.url == '/todos' && req.method == 'GET') {
    res.writeHeader(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: todos,
      })
    );
    res.end();
  }
  // POST 新增代辦事項
  else if (req.url == '/todos' && req.method == 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        if (title == undefined) {
          res.writeHeader(404, headers);
          res.write(
            JSON.stringify({
              status: 'false',
              message: 'key值 title 未定義',
            })
          );
          return;
        }

        const todo = {
          title: title,
          id: uuidv4(),
        };
        todos.push(todo);
        res.writeHeader(200, headers);
        res.write(
          JSON.stringify({
            status: 'success post',
            data: todos,
          })
        );
        // res.end();
      } catch {
        res.writeHeader(404, headers);
        res.write(
          JSON.stringify({
            status: 'false',
            message: '非JSON格式',
          })
        );
        // res.end();
      } finally {
        res.end();
      }
    });
  }
  // PATCH 更改某比代辦事項
  else if (req.url.startsWith('/todos/') && req.method == 'PATCH') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const index = todos.findIndex((ind) => ind.id == id);

        if (title == undefined) {
          res.writeHeader(404, headers);
          res.write(
            JSON.stringify({
              status: 'false',
              message: '鍵值 title 未定義',
            })
          );
          res.end();
          return;
        }
        else if(index == -1){
            res.writeHeader(404, headers);
            res.write(
              JSON.stringify({
                status: 'false',
                message: '無符合的資料',
              })
            );
            res.end();
            return;
        }

        todos[index].title = title;
        res.writeHeader(200, headers);
        res.write(
          JSON.stringify({
            status: 'success',
            data: todos,
            message: `已更新 id : ${id} 的資料`,
          })
        );
        res.end();
      } catch {
        res.writeHeader(404, headers);
        res.write(
          JSON.stringify({
            status: 'false',
            message: '非JSON格式',
          })
        );
        res.end();
      }
    });
  } 
  // DELETE 刪除全部代辦事項
  else if (req.url == '/todos' && req.method == 'DELETE') {
    todos.length = 0;
    res.writeHeader(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: todos,
        message: '已刪除全部資料',
      })
    );
    res.end();
  }
  // DELETE 刪除單筆代辦事項
  else if (req.url.startsWith('/todos/') && req.method == 'DELETE') {
    const id = req.url.split('/').pop();
    const index = todos.findIndex((ind) => ind.id == id);

    if (index == -1) {
      res.writeHeader(404, headers);
      res.write(
        JSON.stringify({
          status: 'false',
          message: '無符合的資料',
        })
      );
      res.end();
      return;
    }

    todos.splice(index, 1);

    res.writeHeader(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: todos,
        message: `已刪除 id : ${id} 的資料`,
      })
    );
    res.end();
  }
  // OPTIONS 確認跨網域是否有問題
  else if (req.method == 'OPTIONS') {
    res.writeHeader(200, headers);
    res.end();
  } 
  // 路由名稱錯誤
  else {
    res.writeHeader(404, headers);
    res.write(
      JSON.stringify({
        status: 'false',
        message: '路由錯誤,請加上/todos路由',
      })
    );
    res.end();
  }
};

const server = http.createServer(RequestListen);
server.listen(process.env.PORT || 8080);