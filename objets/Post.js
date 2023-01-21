var mongo = require('mongodb');
var url = "mongodb://localhost:27017";
require('dotenv').config();
const mongoose = require('mongoose')

class Post{
	constructor(title, content) {
	    this.title = title;
	    this.content = content;
	}	

}
var MongoClient=mongo.MongoClient;

function insertPost(post) {
   var MongoClient = require('mongodb').MongoClient;

  var url = 'mongodb://127.0.0.1:27017/mongomean';

  var insertDoc = function(db, callback) {
    var collection = db.collection('post');

    collection.insertOne(post,  function(err,docs){
        if (err) throw err;
        console.log("inserted successfully");
        callback;
    })

  }

  MongoClient.connect(url, function(err, client){
    if (err) throw err;
     console.log("it is working");
    // db.close();
    insertDoc(client.db('mongomean'), function(){
        db.close();
    });
})  

}

function getAll()
{
  var MongoClient = require('mongodb').MongoClient;
  var url = 'mongodb://127.0.0.1:27017/mongomean';
  var retour= {};
  MongoClient.connect(url, function(err, db) {
    if (err) { 
      console.log("Cannot connect to db (db.js)");
      callback(err);
    }
    else {
        console.log("Connected to DB from db.js: ");

        //Read document by owner

        // Get the documents collection
        database=db.db('mongomean');
        var collection = database.collection('post');

        // Find document
        collection.find({}).toArray(function (err, result) {
            if (err) {
                console.log(err);
            } else if (result.length) {
               //console.log('Found:', result);
               retour= JSON.stringify(result);
               //console.log(resultat);
                return retour;
            } else {
                console.log('No document(s) found with defined "find" criteria!');
            }

        // Close connection
        //db.close();

          return retour;
        });

    }
  })
}


function selectAllPost(){
    MongoClient.connect('mongodb://127.0.0.1:27017/', function (err, db) {
    if (err) throw err;

    var db = db.db('mongomean');

    db.collection('post').find({}, function (findErr, result) {
        if (findErr) throw findErr;
        console.log(result.title);
        db.close();
        
    });
    });    
}

function deletePost(idDeleter){
    var MongoClient = require('mongodb').MongoClient;
    var url = 'mongodb://127.0.0.1:27017/';

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mongomean");
       
      dbo.collection("test").deleteOne({_id: idDeleter}, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        db.close();
      });
    });  
}

function supprimer(idDeleter){
  var MongoClient = require('mongodb').MongoClient;

  var url = 'mongodb://127.0.0.1:27017/mongomean';

  var deletDocuments = function(db, callback) {
    var collection = db.collection('test');

    collection.deleteOne({_id: idDeleter}, function(err,docs) {
        if (err) throw err;
        console.log("1 element supprimer");
        callback;
    })

  };


  MongoClient.connect(url, function(err, client){
    if (err) throw err;
    console.log("it is working");
    deletDocuments(client.db('mongomean'), function(){
      console.log("the delete is working");
        db.close();
    });
})

}

function select(){

  var MongoClient = require('mongodb').MongoClient;

  var url = 'mongodb://127.0.0.1:27017/mongomean';

  var findDocuments = function(db, callback) {
    var collection = db.collection('post');

    collection.find({}).toArray(function(err,docs){
        if (err) throw err;
        console.log(docs);
        callback;
    })

  }

  MongoClient.connect(url, function(err, client){
    if (err) throw err;
     console.log("it is working");
    // db.close();
    findDocuments(client.db('mongomean'), function(){
        db.close();
    });
})
}






module.exports=Post;
module.exports.insertPost = insertPost;
module.exports.getAll = getAll;
//exports.getAll=getAll;
exports.selectAllPost=selectAllPost;
module.exports.select = select;
module.exports.supprimer = supprimer;