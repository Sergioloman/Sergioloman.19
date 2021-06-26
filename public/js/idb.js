let db;
const request = indexedDB.open('Budget_Tracker', 1);

request.onupgradeneeded = function(event){
    const db = event.target.result;
    db.createObjectStore("new_budget",{autoIncrement: true});
};

request.onsuccess = function(event){
    db = event.target.result;
    if (navigator.onLine){
        uploadData()
    }
}
request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record){
    const transaction = db.transaction(['new_budget'], 'readwrite')
    const transactionObjectStore = transaction.objectStore('new_budget')
    transactionObjectStore.add(record)
}
function uploadData(){
    const transaction = db.transaction(['new_budget'], 'readwrite')
    const transactionObjectStore = transaction.objectStore('new_budget')
    const getAll = transactionObjectStore.getAll()


    getAll.onsuccess=function(){
        if(getAll.result.length > 0){
            console.log('success!')
            fetch('/api/transaction',{
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers:{
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type':'application/json'
                }
            })
            .then(response=>response.json())
            .then(serverResponse =>{
                if (serverResponse.message){
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_budget'], 'readwrite')
                const transactionObjectStore = transaction.objectStore('new_budget')
                transactionObjectStore.clear()
            })
            .catch(err=>{console.log(err)})
        }
    }
}
// listen for app coming back online
window.addEventListener('online', uploadData);
