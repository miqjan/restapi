exports.up = function (knex) {
    return knex.schema
        .createTable('Users', function (table) {
            table.increments('id').primary();
            //table.integer('parentId').unsigned().references('id').inTable('Person');
            table.string('username').notNull();
            table.string('firstName').nullable();
            table.string('lastName').nullable();
            table.string('email').notNull();
            table.string('password').notNull();
            table.string('profilid').nullable();
            table.integer('age').nullable();
            table.json('address').nullable();
            table.dateTime('createdAt').notNull().defaultTo(knex.fn.now());//.CarrentTime default;
        })
        .createTable('Email_for_verification', function (table) {
            table.increments('id').primary();
            table.string('email').notNull();;
            table.dateTime('createdAt').notNull().defaultTo(knex.fn.now());//.CarrentTime default;
            table.text('user_agent').nullable();
            table.integer('verificated').nullable();
        })
    
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('Email_for_verification')
        .dropTableIfExists('User');
};





    //   .createTable('Animal', function (table) {
    //     table.increments('id').primary();
    //     table.integer('ownerId').unsigned().references('id').inTable('Person');
    //     table.string('name');
    //     table.string('species');
    //   })
    //   .createTable('Person_Movie', function (table) {
    //     table.increments('id').primary();
    //     table.integer('personId').unsigned().references('id').inTable('Person').onDelete('CASCADE');
    //     table.integer('movieId').unsigned().references('id').inTable('Movie').onDelete('CASCADE');
    //   });