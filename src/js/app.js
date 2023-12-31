//global App object to manage our application
App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // load in the pet data
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    //call the function initWeb3()
    //The web3 JavaScript library interacts with the Ethereum blockchain
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance? (from Mist or MetaMask)
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache (7445 or Truffle Develop 9545)
      // this fallback is fine for development environments, but insecure and not suitable for production.
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  // instantiate our smart contract so web3 knows where to find it and how it works.
  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      // Artifacts are information about our contract such as its deployed address and Application Binary Interface (ABI). 
      //The ABI is a JavaScript object defining how to interact with the contract including its variables, functions and their parameters.
      var AdoptionArtifact = data;
      //creates an instance of the contract we can interact with.
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;
    //access the deployed Adoption contract
    App.contracts.Adoption.deployed()
    .then(function(instance) {
      //declare the variable adoptionInstance outside of the smart contract calls so we can access it after initially retrieving it.
      adoptionInstance = instance;
      //call getAdopters() on that instance.
      //call() allows us to read data from the blockchain without having to send a full transaction, meaning we won't have to spend any ether.
      return adoptionInstance.getAdopters.call();
    })
    .then(function(adopters) {
      //After calling getAdopters(), we then loop through all of them, checking to see if an address is stored for each pet.
      for (i = 0; i < adopters.length; i++) {
        //Since the array contains address types, Ethereum initializes the array with 16 empty addresses. 
        //This is why we check for an empty address string rather than null or other falsey value.
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          // a petId with a corresponding address is found, disable its adopt button and change the button text to "Success"
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    })
    .catch(function(err) {
      // errors are logged to the console
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    //use web3 to get the user's accounts.
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      //select the first account.
      var account = accounts[0];
      //get the deployed contract as we did above and store the instance in adoptionInstance
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account; send transaction
        //Transactions require a "from" address and have an associated cost.
        return adoptionInstance.adopt(petId, {from: account});
      })
      //The result of sending a transaction is the transaction object.
      .then(function(result) {
        //there are no errors, we proceed to call our markAdopted()
        return App.markAdopted();
      })
      .catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
