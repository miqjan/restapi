module.exports = {
    development: {
      client: 'mysql',
     
      connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'restapi'
      }
      
    },
    test: {
      client: 'mysql',
     
      connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'testapi'
      }
      
    },
    production: {
      client: '',
      connection: {
        database: 'example'
      },
      pool: {
        min: 2,
        max: 10
      }
    }
  };