var mongo = require('mongodb');
var url = "mongodb://127.0.0.1:27017/";
var md5=require("md5");
/*
class Utilisateur{
	constructor(nom, prenom) {
	    this.nom = nom;
	    this.prenom = prenom;
	}	

}*/
var MongoClient=mongo.MongoClient;
function insert(utilisateur) {
	var reponse=null;
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  utilisateur.mdp=md5(utilisateur.mdp);
	  reponse= dbo.collection("SuperAdmin").insertOne(utilisateur, function(err, res) {
	    if (err) throw err;
	    //console.log(utilisateur);
	    //console.log("1 document inserted");
	    reponse=utilisateur;
	    db.close();
	  });
	}); 
	return reponse;
}	

async function connect(utilisateur) {
	let reponse=null;
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  //console.log(utilisateur);
	  var query={mail:utilisateur.mail,mdp:md5(utilisateur.mdp)};
	  reponse= dbo.collection("SuperAdmin").findOne(query, async function(err, res) {
	    if (err){
	    	reponse=null;
	    	//return null;
	    	//throw err;
	    } 
	    db.close();
	    reponse=JSON.stringify(res);
	    //return JSON.stringify(res);
	  });
	}); 
	return reponse;
}	


//module.exports=Utilisateur
exports.insert=insert;
exports.connect=connect;