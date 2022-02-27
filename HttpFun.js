function HttpMethod(res, HttpCode, status, data, message) {
  const headers = {
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  };

  res.writeHeader(HttpCode, headers);

  if (HttpCode == 200) {
    res.write(
      JSON.stringify({
        status: status,
        data: data,
        message:message
      })
    );
  }
  else if(HttpCode == 404){
    res.write(
        JSON.stringify({
          status: status,
          message: message,
        })
      );
  }
  res.end();
}

module.exports = HttpMethod;
