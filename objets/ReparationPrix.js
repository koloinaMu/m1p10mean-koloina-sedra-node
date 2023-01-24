var mongo = require('mongodb');
var url = "mongodb://localhost:27017";
require('dotenv').config();
const mongoose = require('mongoose')

class ReparationPrix{
	constructor(id,nom, prix) {
	    this._id= id
      this.nom = nom;
	    this.prix = prix;
	}	

}
var MongoClient=mongo.MongoClient;

function insererReparationPrix(reparation) {
   var MongoClient = require('mongodb').MongoClient;

  var url = 'mongodb://127.0.0.1:27017/mongomean';

  var insertDoc = function(db, callback) {
    var collection = db.collection('reparationPrix');

    collection.insertOne(reparation,  function(err,docs){
        if (err) throw err;
        console.log("reparation inserted successfully");
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



function supprimer(idDeleter){
  var MongoClient = require('mongodb').MongoClient;

  var url = 'mongodb://127.0.0.1:27017/mongomean';

  var deletDocuments = function(db, callback) {
    var collection = db.collection('reparationPrix');

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








module.exports=ReparationPrix;
module.exports.insererReparationPrix = insererReparationPrix;
module.exports.supprimer = supprimer;
//exports.insert=insertPost;
//exports.selectAllPost=selectAllPost;
//exports.select=select;
//module.exports.getLastId_reparationPrix = getLastId_reparationPrix;