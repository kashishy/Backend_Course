const MongoClient = require('mongodb').MongoClient;  //mongoClient to connect to mongodb server
const assert = require('assert'); //for checking values of variables
const dboper = require('./operations'); //importing operation module

//to start mongo server type mongod --dbpath=data --bind_ip 127.0.0.1 in mongodb folder using terminal
//mongodb  requires connection string to connect
//by default mongodb server runs on mongodb://127.0.0.1:27017/
const url = 'mongodb://localhost:27017/';
//name of the database in mongodb database that used here
const dbname = 'conFusion';


//using promises to remove callback hell, promises tell that the value may come in future
//if not received then handle error, .then() to register a promise and .catch() to catch any error in completion

MongoClient.connect(url)
.then((client) => {

    console.log('Connected correctly to server');

    const db = client.db(dbname);

    dboper.insertDocument(db, { name: "Vadonut", description: "Test"}, "dishes")
    .then((result) => {

        console.log("Insert Document:\n", result.ops);

        return dboper.findDocuments(db, 'dishes');
    })
    .then((docs) => {
        console.log("Found Documents:\n", docs);

        return dboper.updateDocument(db, { name: "Vadonut" }, { description: "Updated Test" }, "dishes");
    })
    .then((result) => {
        console.log("Updated Document:\n", result.result);

        return dboper.findDocuments(db, "dishes");
    })
    .then((docs) => {
        console.log("Found Updated Documents:\n", docs);
                        
        return db.dropCollection("dishes");
    })
    .then((result) => {
        console.log("Dropped Collection: ", result);

        return client.close();
    })
    .catch((err) => console.log(err));
})
.catch((err) => console.log(err));


//with using operations.js module
/*MongoClient.connect(url, (err, client) => {

    //to check error in connecting
    assert.equal(err,null);

    console.log('Connected correctly to server');

    const db = client.db(dbname);
    
    //tree structure of nested callbacks, this will lead to callback hell problem
    //inserting new document into database
    dboper.insertDocument(db, { name: "Vadonut", description: "Test"}, "dishes", (result) => {

        //result variable contains details of the insert operation by mongodb
        console.log("Insert Document:\n", result.ops);

        dboper.findDocuments(db, "dishes", (docs) => {
            console.log("Found Documents:\n", docs);

            dboper.updateDocument(db, { name: "Vadonut" }, { description: "Updated Test" }, "dishes", (result) => {

                    console.log("Updated Document:\n", result.result);

                    //for updated documents
                    dboper.findDocuments(db, "dishes", (docs) => {
                        console.log("Found Updated Documents:\n", docs);
                        
                        //drop the etire data in collection
                        db.dropCollection("dishes", (result) => {
                            console.log("Dropped Collection: ", result);

                            //closing connection to the database
                            client.close();
                        });
                    });
                });
        });
    });*/
 

    //without using operations.js module

    /*const collection = db.collection("dishes");
    collection.insertOne({"name": "Uthappizza", "description": "test"},
    (err, result) => {
        assert.equal(err,null);

        console.log("After Insert:\n");
        console.log(result.ops);

        //print all documents inside the collection
        collection.find({}).toArray((err, docs) => {

            //checking for any error
            assert.equal(err,null);
            
            console.log("Found:\n");
            console.log(docs);

            //deleting the current collection in database
            db.dropCollection("dishes", (err, result) => {
                assert.equal(err,null);

                //closing connection with the database
                client.close();
            });
        });
    });*//*

});*/