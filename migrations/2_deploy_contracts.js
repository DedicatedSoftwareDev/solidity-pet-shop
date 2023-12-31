/*A migration is a deployment script meant to alter the state of your application's contracts, 
moving it from one state to the next. For the first migration, 
you might just be deploying new code, but over time, 
other migrations might move data around or replace a contract with a new one.*/
var Adoption = artifacts.require("Adoption");

module.exports = function(deployer) {
    deployer.deploy(Adoption);
};