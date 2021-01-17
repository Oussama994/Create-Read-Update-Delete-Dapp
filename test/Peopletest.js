const People = artifacts.require("People");
const truffleAssert = require("truffle-assertions");

contract("People", async function(accounts){

  let instance;

  before(async function(){
    instance = await People.deployed()
  });

  it("shouldn't create a person with age over 150 years", async function(){
    await truffleAssert.fails(instance.createPerson("Bob", 200, 190, {value: web3.utils.toWei("1", "ether")}), truffleAssert.ErrorType.REVERT);
  });
  it("shouldn't create a person without payment", async function(){
    await truffleAssert.fails(instance.createPerson("Bob", 50, 190, {value: 1000}), truffleAssert.ErrorType.REVERT);
  });
  it("should set senior status correctly", async function(){
    await instance.createPerson("Bob", 65, 190, {value: web3.utils.toWei("1", "ether")});
    let result = await instance.getPerson();
    assert(result.senior === true, "Senior level not set");
  });
  it("should set age correctly", async function(){
    let result = await instance.getPerson();
    assert(result.age.toNumber() === 65, "Age not set correctly");
  });
  it("should not allow non-owner to delete people", async function(){
    let instance = await People.deployed();
    await instance.createPerson("Lisa", 35, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.fails(instance.deletePerson(accounts[2], {from: accounts[2]}), truffleAssert.ErrorType.REVERT);
  });
  it("should allow the owner to delete people", async function(){
    let instance = await People.new();
    await instance.createPerson("Lisa", 35, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(instance.deletePerson(accounts[1], {from: accounts[0]}));
  });
  it("it should add balance correctly after createPerson call with 1 ether", async function(){
   let instance = await People.new();
   await instance.createPerson("Lisa",35,160, {from: accounts[2], value:web3.utils.toWei("1","ether")});
   let balance = await instance.balance();
   let floatbalance=parseFloat(balance);// the balance recorded in the contract using the variable uint public
   let realbalance = parseFloat(await web3.eth.getBalance(instance.address))// the balance recorded in the Blockchain
   assert(floatbalance == web3.utils.toWei("1","ether") && floatbalance == realbalance);
  })

  it("it should allow the owner to withraw the balance",async function(){
  let instance = await People.new();
  await instance.createPerson("Lisa",36,160,{from: accounts[2], value : web3.utils.toWei("1","ether")})
    await truffleAssert.passes(instance.withdrawAll({from:accounts[0]})    );
  })
it("it should not allow a non-owner to withdraw the balance",async function(){
 let instance = await People.new();
 await instance.createPerson("lisa",35,160, {from: accounts[2], value : web3.utils.toWei("1","ether")});
 await truffleAssert.fails(instance.withdrawAll({from:accounts[2]}));
})
it("Owners balance should increase after withdrawal", async function(){
 let instance = await People.new();
 await instance.createPerson("Lisa",35,160,{from : accounts[2], value: web3.utils.toWei("1","ether")});
  let beforeBalance = parseFloat(await web3.eth.getBalance(accounts[0]));
  await instance.withdrawAll();
  let afterBalance =parseFloat(await web3.eth.getBalance(accounts[0]));
  assert(beforeBalance<afterBalance,"owners balance did not increase after withdrawal");
})
it("it should reset balance to zero after withrawal", async function(){
  let instance = await People.new();
  await instance.createPerson("Lisa",35,160, {from: accounts[2], value:web3.utils.toWei("1","ether")});
   await instance.withdrawAll();
   let balance = await instance.balance();
   let floatbalance=parseFloat(balance);
   let realbalance = await web3.eth.getBalance(instance.address);
   assert(realbalance == web3.utils.toWei("0","ether") && realbalance == floatbalance,"Contract balance was not 0 after withdrawal or did not match");
})
});
