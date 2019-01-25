const localStorageController = (function() {
    return {
      getSavedItems: function() {
        var dataJSON = localStorage.getItem("data");
        if (dataJSON != null) {
          return JSON.parse(dataJSON);
        } else {
          return {
              item: [],
              total: 0
          };
        }
      },
      saveTolocalStroage: function(obj) {
        localStorage.setItem("data", JSON.stringify(obj));
      }
    };
  })();
const budgetController = (function(storagectrl) {
  var FoodItem = function(id, description, calories) {
    this.id = id;
    this.description = description;
    this.calories = calories;
  };
  // Get Data from LocalStorage   
  var data = storagectrl.getSavedItems();

  return {
    addItem: function(desc, calories) {
      var ID = 0;

      // id = last ID + 1
      if (data.item.length > 0) {
        ID = data.item[data.item.length - 1].id + 1;
      } else {
        ID = 0;
      }
      var newItem = new FoodItem(ID, desc, calories);
      data.item.push(newItem);
      return newItem;
    },

    updateItem: function(obj){

      var filteredItem = data.item.find(function(current){
        return current.id === parseInt(obj.id);
      });

      data.item.forEach(function(current){
        if(filteredItem.id === current.id){
          current.description = obj.description;
          current.calories = obj.calories;
        }
      });
    },

    calculateTotal: function() {
      var sum = 0;
      data.item.forEach(function(curr) {
        sum = sum + Number(curr.calories);
      });

      data.total = parseInt(sum);
      return sum;
    },

    deleteItem: function (input) {
      var filteredData = data.item.find(function(current){
        return current.description === input.desc && current.calories === input.calories;
      });
      var ids = data.item.map(function (curr) {
        return curr.id;
      })
      var index = ids.indexOf(parseInt(filteredData.id));
      if(index > -1){
        data.item.splice(index,1); 
      }else{
        console.log("Item Not Found");
      }

      return data;
    },

    dataItem: function() {
      return data;
    }
  };
})(localStorageController);

const UIcontroller = (function() {
  return {
    getInput: function() {
      return {
        desc: document.querySelector("#item-name").value,
        calories: document.querySelector("#item-calories").value
      };
    },

    addInputToUI: function(obj) {
      //     <li class="collection-item" id="obj-0">
      //      <strong>Eggs: </strong> <em>300 Calories</em>
      //          <a href="#" class="secondary-content">
      //              <i class="fa fa-pencil"></i>
      //           </a>
      //   </li>
      var itemId = `obj-${obj.id}`;
      var listEl = document.createElement("li");
      listEl.classList.add("collection-item");
      listEl.id = itemId;

      var strongEl = document.createElement("strong");
      strongEl.textContent = `${obj.description}: `;

      var emphasizedEl = document.createElement("em");
      emphasizedEl.textContent = `${obj.calories} Calories`;

      var linkEl = document.createElement("a");
      linkEl.setAttribute("href", "#");
      linkEl.classList.add("secondary-content");

      var pencilEl = document.createElement("i");
      pencilEl.classList.add("fa", "fa-pencil");

      linkEl.appendChild(pencilEl);

      listEl.appendChild(strongEl);
      listEl.appendChild(emphasizedEl);
      listEl.appendChild(linkEl);

      document.querySelector("#item-list").appendChild(listEl);
    },

    deleteListItem: function(selector){
      var el = document.getElementById(selector);
      el.remove();
    },

    updateListItem: function(selector){
      var el = document.getElementById(selector);
      var elId= el.id.split("-")[1];
      var obj = this.getInput();
      return {
        id: elId,
        description: obj.desc,
        calories: obj.calories
      }
    },
    clearFields: function() {
      var item = document.querySelector("#item-name");
      var calories = document.querySelector("#item-calories");

      item.value = "";
      calories.value = "";
      item.focus();
    },

    addTotalToUI: function(total) {
      var totalSpan = document.querySelector(".total-calories");
      totalSpan.textContent = total;
    }

  };
})();

const Controller = (function(budgetctrl, UIctrl, storagectrl) {
  var objId;
  function setupEventListener() {
    
    
    // Add Data to UI from LocalStorage
    getDataFromLocalStorage();

    // Hide Buttons on window onload
    hidebuttons();

    // Add Input to the UI and DS
    document.querySelector(".add-btn").addEventListener("click", function(e) {
      e.preventDefault();
      // Get input values from the UI
      var input = UIctrl.getInput();
      //    {desc: "Salad", calories: "100"}
      if (input.desc !== "" && !isNaN(input.calories) && input.calories !== "") {
        //1- Add Input values To the DS
        var newItem = budgetctrl.addItem(input.desc, input.calories);
        //    FoodItem {id: 0, description: "Salad", calories: "100"}

        //2 - Add Input Values to the UI
        UIctrl.addInputToUI(newItem);

        // 3- Clear Input Values From UI
        UIctrl.clearFields();

        // 4- Calculate Total
        var total = budgetctrl.calculateTotal();

        // 5- Add Total To The UI
        UIctrl.addTotalToUI(total);

        // 6- Save Data To Local Storage
        storagectrl.saveTolocalStroage(budgetctrl.dataItem());
      }
    });

    // Show update and delete Buttons and Getting Input from DS
    document.addEventListener("click", function(e){
        e.preventDefault();
        if(e.target.classList.contains("fa-pencil")){
            document.querySelector(".add-btn").style.display = "none";
            document.querySelector(".update-btn").style.display = "inline-block";
            document.querySelector(".delete-btn").style.display = "inline-block";
            // Public Variable
             objId = e.target.parentElement.parentElement.id;
 
             var data = budgetctrl.dataItem();
             var filteredData = data.item.find(function(current){
               return current.id === parseInt(objId.split("-")[1]);
             });
             document.querySelector("#item-name").value = filteredData.description;
             document.querySelector("#item-calories").value = filteredData.calories;
        }
    });

    // Back Button Clicked
    document.querySelector(".back-btn").addEventListener("click",function(e){
      e.preventDefault();
      var updateBtn = document.querySelector(".update-btn");
      var deleteBtn = document.querySelector(".delete-btn ");
      var addBtn = document.querySelector(".add-btn");

      if(addBtn.style.display === "none"){
        addBtn.style.display = "inline-block";
        updateBtn.style.display = "none";
        deleteBtn.style.display = "none";
        UIctrl.clearFields();
      }
    })

    document.querySelector(".update-btn").addEventListener("click", function(e){
        e.preventDefault();
        
        var updateId = objId;
        var newObj = UIctrl.updateListItem(updateId);


        budgetctrl.updateItem(newObj);
        
        UIctrl.deleteListItem(updateId);
        UIctrl.addInputToUI(newObj);
        UIctrl.clearFields();
        
        hidebuttons();
        document.querySelector(".add-btn").style.display = "block";
        // Calculate Total
        var total = budgetctrl.calculateTotal();

        // Add Total To The UI
        UIctrl.addTotalToUI(total);

        // Save Data To Local Storage
        storagectrl.saveTolocalStroage(budgetctrl.dataItem());
    });

    // DeleteItem
    document.querySelector(".delete-btn").addEventListener("click", ctrlDeleteItem);

    // Clear All UI data and local Storage Data,
    document.querySelector(".clear-btn").addEventListener("click", function(e){
        e.preventDefault();
        // Clear THE UI
        document.querySelector("#item-list").innerHTML = "";
        document.querySelector(".total-calories").textContent = 0;

        // Clear Data from LocalStorage
        localStorage.clear();
    }); 
  }

  function ctrlDeleteItem(event){
    event.preventDefault();
    var input = UIctrl.getInput();

    // Delete From Data Structure
    var newdata = budgetctrl.deleteItem(input);

    // Delete From LocalStorage
    storagectrl.saveTolocalStroage(newdata);

    // Delete From UI
    UIctrl.clearFields();
    hidebuttons();
    document.querySelector(".add-btn").style.display = "block";
    UIctrl.deleteListItem(objId);


     // Calculate Total
     var total = budgetctrl.calculateTotal();

     // Add Total To The UI
     UIctrl.addTotalToUI(total);

    //  Add Total To LocalStorage
     storagectrl.saveTolocalStroage(budgetctrl.dataItem());

  }

  function hidebuttons(){
     document.querySelector(".update-btn").style.display = "none";
     document.querySelector(".delete-btn ").style.display = "none";
  }

  function getDataFromLocalStorage() {
    // Add Data to UI from LocalStorage
    var newData = storagectrl.getSavedItems();
    if (newData != "") {
        newData.item.forEach(function(list){
            UIctrl.addInputToUI(list);
        })
        UIctrl.addTotalToUI(newData.total);
    }
  }

  return {
    init: function() {
      console.log("Application has started");
      setupEventListener();
    }
  };
})(budgetController, UIcontroller, localStorageController);

Controller.init();
