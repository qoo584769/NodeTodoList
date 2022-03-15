// require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_DB_CONNECTING_STRING;
const client = new MongoClient(uri);

// -----------------------------------------------------------
// 查詢單一資料
async function FindOne() {
  try {
    await client.connect();
    const database = client.db('todolist');
    const todos = database.collection('todos');
    const query = { title: /事/ };
    const options = {
      projection: { _id: 0 },
    };
    const result = await todos.findOne(query, options);
  } finally {
    await client.close();
  }
}
// FindOne().catch(console.dir);

// -----------------------------------------------------------
// 新增單一資料
async function InsertOne(data) {
  try {
    await client.connect();

    const database = client.db('todolist');

    const todos = database.collection('todos');

    await todos.insertOne(data);
  } finally {
    await client.close();
  }
}
// InsertOne().catch(console.dir);

// -----------------------------------------------------------
// 新增多筆資料
async function InsertMany(data) {
  try {
    await client.connect();

    const database = client.db('todolist');

    const todos = database.collection('todos');

    const options = { ordered: true };

    const result = await todos.insertMany(data, options);

    console.log(`${result.insertedCount} documents were inserted`);
  } finally {
    await client.close();
  }
}

// InsertMany().catch(console.dir);

// -----------------------------------------------------------
// 修改單一資料
async function UpdateOne(id, title) {
  try {
    await client.connect();

    const database = client.db('todolist');

    const todos = database.collection('todos');

    const filter = { id: id };

    const options = { upsert: true };

    const UpdateTodo = {
      $set: {
        title: title,
      },
    };

    const result = await todos.updateOne(filter, UpdateTodo, options);

    console.log(
      `找到 ${result.matchedCount} 筆條件符合資料, 已更新 ${result.modifiedCount} 筆資料`
    );
  } finally {
    await client.close();
  }
}
// UpdateOne().catch(console.dir);

// -----------------------------------------------------------
// 刪除單一資料
async function DeleteOne(id) {
  try {
    await client.connect();

    const database = client.db('todolist');

    const todos = database.collection('todos');

    const query = { id: id };

    const result = await todos.deleteOne(query);

    if (result.deletedCount === 1) {
      console.log(`以刪除一筆 id : ${id} 的資料`);
    } else {
      console.log('No documents matched the query. Deleted 0 documents.');
    }
  } finally {
    await client.close();
  }
}

// DeleteOne().catch(console.dir);

// -----------------------------------------------------------
// 刪除全部資料
async function DeleteMany() {
  try {
    await client.connect();

    const database = client.db('todolist');

    const todos = database.collection('todos');

    const result = await todos.deleteMany();

    console.log('已刪除全部 ' + result.deletedCount + ' 筆資料');
  } finally {
    await client.close();
  }
}

// DeleteMany().catch(console.dir);

module.exports = {
  InsertOne,
  InsertMany,
  FindOne,
  UpdateOne,
  DeleteOne,
  DeleteMany,
};
