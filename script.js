/*Firebase Configuration Class*/

const firebaseConfig = {
  //API KEYS
};

/*Initialize Firebase connection*/
firebase.initializeApp(firebaseConfig);
arr = [];
/*Firebase class*/
class Firebase {
    constructor() {
        this.dataBase = firebase.database();
    }
    /**
    * setData() take input parameter as referance string
    *  and value to be set and updated firebase database
    * @param {String} referance 
    * @param {String} value 
    */
    setData(referance, value) {
        this.dataBase.ref(referance).set(value);
    }

    /**
    *delete() take input parameter as intemID
    *and delete that item from firebase database 
    * @param {Number} itemId 
    */
    delete(itemId) {
        this.dataBase.ref('items/' + itemId).remove();
    }

    /**
     * getData() take input parameter as intemID 
     * and get the items value from database
     * @param {Number} itemId 
     * @returns {Object}
     */
    getData(id, inputElm) {
        var values;
        this.dataBase.ref('items/' + id).once('value').then(function (snapshot) {
            values = snapshot.val()
            //console.log(values.id, values.completedStatus);
            inputElm.value = values.value;
            //    return [values.id,values.value,values.completedStatus]
        });
    }

    /**
     *updateCompletationStatus() take input item_id 
     *and toggle completion status 
     * @param {Number} item_id 
     */
    updateCompletationStatus(item_id) {
        var status, query;
        query = 'items/' + item_id + '/completedStatus';
        var z = this.dataBase.ref(query).once('value', function (snapshot) {
            status = snapshot.val();
        });
        status == false ? status = true : status = false;
        this.setData(query, status);
    }
    getAllData(callback) {
        var object = this.dataBase.ref('items');
        object.on('value', function (snapshot) {
            arr = [];
            snapshot.forEach(function (keysSnapshot) {
                var keys = keysSnapshot.val();
                arr.push(keys);

            })
            callback();
        });
    }

}

/**
 *TODO-class 
 */
class Todo {
    _id = 0;
    trackID = 0;

    /*creating a instant for Firebase Connections*/

    firebaseConnection = new Firebase();
    /**
     * getId() take the id from html-tag
     * and returns the id of the object 
     * @param {String} ob 
     */
    getId(ob) {
        return ob.split("_")[0];
    }

    /**
     * addItem() add items to the firebase database
     */
    addItem() {
        var ref, obj;
        document.getElementById("message").innerHTML = "";
        var newItemValue = document.getElementById("inputTextBox").value;
        if (newItemValue != "") {
            obj = {
                id: (++this._id),
                value: newItemValue,
                completedStatus: false
            };

            ref = 'items/' + obj.id;
            this.firebaseConnection.setData(ref, obj);
            //this.displayItems();
            document.getElementById("inputTextBox").value = "";
        }
        else {
            document.getElementById("message").innerHTML = "Input Filed is empty";

            document.getElementById("inputTextBox").focus();
        }
    }

    /**
     *displayItems() fetch json the data from Firebase 
     *converts in Javascript object and Display in HTML 
     */
    displayItems() {
        var className = "";
        var table_tag = document.getElementById("tableNode");
        table_tag.innerHTML = "";
        for (let i = 0; i < arr.length; i++) {
            // console.log(arr[i].id);
            arr[i].completedStatus == false ? className = "" : className = `strike`;
            var str = `<tr class="${className}"><td id="${arr[i].id}_t" onclick="todo.setComletedStatus(this.id)" class="itemValue">${arr[i].value}</td><td><button id="${arr[i].id}_e" class="btnx btn btn-info" onclick="todo.editItem(this.id)">
             Edit </button> <button id="${arr[i].id}_d" onclick="todo.deleteItem(this.id)" class="btnx btn btn-info">Delete</button></td></tr>`;
            table_tag.innerHTML += str;
            todo._id = arr[i].id;
            //});
        }
    }
    /*editItem() set input box value to old value 
    *and changes button name and set trackID 
    *value to keep track of item */
    /**
     * 
     * @param {*} ob 
     */
    editItem(ob) {
        var itemId = this.getId(ob);
        var butn = document.getElementById("inputBtn");
        var input = document.getElementById("inputTextBox");;
        this.trackID = itemId;
        this.firebaseConnection.getData(itemId, input);
        document.getElementById("inputTextBox").focus();
        butn.innerText = "Save";
        butn.setAttribute("onclick", "todo.updateItem();");
    }

    /**
     *updateItem() update the firebase 
     *database based on the trackID value 
     */
    updateItem() {
        var newvalue = document.getElementById("inputTextBox").value;
        var ref = 'items/' + this.trackID + '/value';
        var b = document.getElementById("inputBtn");
        this.firebaseConnection.setData(ref, newvalue);
        b.innerText = "Add";
        b.setAttribute("onclick", "todo.addItem();");
        document.getElementById("inputTextBox").value = "";
        this.displayItems();
    }

    /**
     * setStatus() updates the completedStatus in firebase
     * @param {String} id 
     */
    setComletedStatus(id) {
        var item_id = this.getId(id);
        this.firebaseConnection.updateCompletationStatus(item_id);
    }


    /**
     *removeArrayItem() deletes the item from firebase 
     *and display updated data 
     * @param {String} id 
     */
    deleteItem(id) {
        var itemId = this.getId(id);
        this.firebaseConnection.delete(itemId);
        this.displayItems();
    }
}

/*Creating a instant for Todo-class*/
const todo = new Todo();
todo.firebaseConnection.getAllData(todo.displayItems);
