let db;
const request = indexedDB.open('Budget_Tracker', 1);

request.onupgradeneeded = function(event){
    const db = event.target.result;
    db.createObjectStore("new_budget",{autoIncrement: true});
};

request.onsuccess = function(event){
    db = event.target.result;
    if (navigator.onLine){
        uploadPage()
    }
}

function saveRecord(record){
    const entry = db.entry(['new_budget'], 'readwrite')
    const entryObjectStore = entry.objectStore('new_budget')
    entryObjectStore.add(record)
}
function uploadData(){
    const entry = db.entry(['new_budget'], 'readwrite')
    const entryObjectStore = entry.objectStore('new_budget')
    getAll.onsuccess = entryObjectStore.getAll()

    getAll.onsuccess=function(){
        if(getAll.result.length > 0){
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
                const entry = db.entry(['new_budget'], 'readwrite')
                const entryObjectStore = entry.objectStore('new_budget')
                entryObjectStore.clear()
            })
            .catch(err=>{console.log(err)})
        }
    }
}
// listen for app coming back online
window.addEventListener('online', uploadData);
