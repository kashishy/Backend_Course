//all database operations are in this
const assert = require('assert');

exports.insertDocument = (db, document, collection, callback) => {
    const coll = db.collection(collection);
    return coll.insert(document);

    //this comment as promise will return to calling function anyway, no need to use callback
    //insert method defined in the driver to insert document to collection
    /*coll.insert(document, (err, result) => {

        //checking any error occured during insertion
        assert.equal(err, null);

        //here result has property result and n tells number of document inserted
        console.log("Inserted " + result.result.n +
            " documents into the collection " + collection);

        //passing result back to calling function
        callback(result);
    });*/
};

exports.findDocuments = (db, collection, callback) => {
    const coll = db.collection(collection);
    return coll.find({}).toArray();

    //{} empty for getting all documents
    /*coll.find({}).toArray((err, docs) => {
        assert.equal(err, null);
        callback(docs);        
    });*/
};

exports.removeDocument = (db, document, collection, callback) => {
    const coll = db.collection(collection);
    return coll.deleteOne(document);
    /*coll.deleteOne(document, (err, result) => {
        assert.equal(err, null);
        console.log("Removed the document ", document);
        callback(result);        
    });*/
};

exports.updateDocument = (db, document, update, collection, callback) => {
    const coll = db.collection(collection);
    //$set for taking feilds that to be updated
    return coll.updateOne(document, { $set: update }, null);/*, (err, result) => {
        assert.equal(err, null);
        console.log("Updated the document with ", update);
        callback(result);        
    });*/
};