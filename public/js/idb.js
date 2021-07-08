// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'pizza_hunt' and set it to version 1
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    //save a reference to the database
    const db = event.target.result;

    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_budget', {autoIncrement : true});

};

request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run uploadBudgetItem function to send all local db data to api
    if (navigator.onLine) {
      // we haven't created this yet, but we will soon, so let's comment it out for now
      uploadBudgetItem()
    }
};
  
request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};


// This function will be executed if we attempt to submit a new budget record and there's no internet connection
function saveRecord (record) {
    const transaction = db.transaction( ['new_budget'], 'readwrite' );
    const budgetObjectStore = transaction.objectStore( 'new_budget' );
    budgetObjectStore.add(record);
}

function uploadBudgetItem() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_budget');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0)
        {
            fetch('/api/transaction', {
                method : 'POST', 
                body : JSON.stringify(getAll.result),
                headers : {
                    Accept : 'application/json, text/plain, */*',
                    'Content-Type' : 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message)
                {
                    throw new Error(serverResponse);
                }

                //open one more transaction
                const transaction = db.transaction(['new_budget'], 'readwrite');

                //access your object store
                const budgetObjectStore = transaction.objectStore('new_budget');

                //clear all items in your store
                budgetObjectStore.clear();

                alert('All saved records has been submitted');
            })
            .catch (err => {
                console.log(err);
            });
        }

    }

};

// listen for app coming back online
window.addEventListener('online', uploadBudgetItem);