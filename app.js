//BUDGET CONTROLLER
var budgetController = (function(){
    //Expense constructor
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome>0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    //Calculating total income and expenses privately
    var calculateTotal = function(type){
         var sum=0;
         data.allItems[type].forEach(function(cur){
             sum += cur.value;
         });
         data.totals[type] = sum;
     };
    
    
    var data = {
        allItems: {
            exp: [],  //ds to store all expenses we will be creating using function constructors
            inc: []   //stores all incomes
    },
        totals: {
            exp: 0,  //total expense
            inc: 0   //total income
    },
        budget: 0,
        percentage: -1
    };
 
    
    //public method to allow other modules to add new item to our data structure
      return {
          addItem: function(type,des,val){
              var newItem, ID;
              
              //Create new ID (last ID+1)
              if(data.allItems[type].length > 0){
                    ID = data.allItems[type][data.allItems[type].length-1].id + 1;
              }else {
                  ID =0;
              }
            
              //Create new item based on 'inc' or 'exp' type      
              if(type === 'exp'){
                  newItem = new Expense(ID,des,val);
                  
              } else if(type === 'inc'){
                  newItem = new Income(ID,des,val);
              }
            
              //Push it into the ds
              data.allItems[type].push(newItem);
              
              //Return the new Item
              return newItem;
          },
          
          //deleting an iem
          deleteItem: function(type, id){
              var ids, index;
              
              ids = data.allItems[type].map(function(current){
                  
                  return current.id; //this returns an array whose elements are the ids of the elemnts present in array                                   data.allItems[type]
              });
              
              index = ids.indexOf(id); //returns the index of the id which is passed form the above elements ids
              
              if (index !== -1){
                  data.allItems[type].splice(index, 1); //delete '1' element for the obtained index
              }
          },
          
        calculateBudget: function(){
          
          //Calculate the total income and expenses
          calculateTotal('exp');
          calculateTotal('inc');
          
          //Calculate the budget : income - expenses
          data.budget = data.totals.inc - data.totals.exp;
          
          //Calculate the % of income that we spent
            if(data.totals.inc >0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);  
            }else {
                data.percentage = -1;
            }
             
      },
          calculatePercentage: function(){
          
          data.allItems.exp.forEach(function(cur){
              cur.calcPercentage(data.totals.inc);
          });
               
      },
          getPercentage: function(){
              var allPerc = data.allItems.exp.map(function(cur){  //using map because we want tp return a new array with all the percentages
                  return cur.getPercentage(); //calling getPercentage() on the current value to return the percentage
              }); 
              return allPerc; //return array containing all the percentages
      },
             
          
          getBudget: function(){
              return {
                  budget: data.budget,
                  totalInc: data.totals.inc,
                  totalExp: data.totals.exp,
                  percentage: data.percentage
              };
          },
          
          testing: function(){
              console.log(data); //making data objects public 
          }
      };
   
})();


//UI CONTROLLER
var UIController = (function(){
    
    //All the keys(/classes) are defined at one place to make it more managable
    //private
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLable : '.budget__value',
        incomeLable : '.budget__income--value',
        expensesLable : '.budget__expenses--value',
        percentageLable : '.budget__expenses--percentage',
        container : '.container',
        expensesPercLable : '.item__percentage',
        dateLabel : '.budget__title--month'
    };
    
//to travers a nodelist like array as we cannot use foreach to traverse nodelist
var nodeListForeach = function(nodelist, callback){
     for (var i=0; i<nodelist.length; i++){
           callback(nodelist[i], i); //function(current, index)
     }
};   
   
    
   return {
       getInput : function(){  //public method can be called from other controllers
           return {
              type : document.querySelector(DOMStrings.inputType).value,  //will return either 'inc' or 'exp'
              description : document.querySelector(DOMStrings.inputDescription).value,
              value :  parseFloat(document.querySelector(DOMStrings.inputValue).value) 
           };
       },
       
       addListItem : function(obj,type){
           var html, newHtml;
           
           //Creat HTML string with placeholder text
           
           if(type === 'inc'){
               
               element=DOMStrings.incomeContainer;
               html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div> </div>';
                                    
           }else if (type === 'exp'){
               
               element=DOMStrings.expensesContainer;
               html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }
           
           //replace the placeholder text with some actual datt
           newHtml=html.replace('%id%', obj.id);
           newHtml=newHtml.replace('%description%', obj.description);
           newHtml=newHtml.replace('%value%', this.formatNumber(obj.value, type)); 
           
           //we can make formatNumber as private by declaring it here like deleteListItem. Call it like =>newHtml=newHtml.replace('%value%', formatNumber(obj.value, type)); 
           
            //Insert HTML into the DOM
           document.querySelector(element).insertAdjacentHTML('beforeend',newHtml); //'beforeend' makes sure that the element id added as the last child of the income/expenses conatiner
       },
       
       //deletins items from UI
       deleteListItem: function(selectorID){ //itemid will be used (inc- or exp-)
            //In JS we cannot simply delete an element, we delete/remove the child
           
           var el = document.getElementById(selectorID);
           el.parentNode.removeChild(el); //element.parentofelement.removethehchild(that is passed here which is the element)
           
       },
        
       //Clear inpur fields
       clearFields: function(){
         var fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue); // this returns a list. Need to convert it to array. Can be tricked and dones as :
           
        fieldArr = Array.prototype.slice.call(fields); //fieldArr is now an array with description and value as it's element
        
        fieldArr.forEach(function(current, index, array){ //traversing ar array with foreach instead of for loop this time
            current.value = ""; //setting it back to empty
        });
           
           fieldArr[0].focus(); //bring focus back to 1st elemet of arr i.e input description
       },
       
       
       //Displaying budgte
       displayBudget: function(obj){
           var type;
           
           obj.budget > 0 ? type ='inc' : type = 'exp';
           document.querySelector(DOMStrings.budgetLable).textContent = this.formatNumber(obj.budget, type);
           document.querySelector(DOMStrings.incomeLable).textContent = this.formatNumber(obj.totalInc, 'inc'); //always +ve=> 'inc'
           document.querySelector(DOMStrings.expensesLable).textContent = this.formatNumber(obj.totalExp, 'exp');
           
           if(obj.percentage > 0){
               document.querySelector(DOMStrings.percentageLable).textContent = obj.percentage + '%';
           }else{
               document.querySelector(DOMStrings.percentageLable).textContent = '---';
           }
    },
       
       displayPercentages: function(percentages){
           var fields = document.querySelectorAll(DOMStrings.expensesPercLable); //we get a node list here as we've seen before. Now insteda of trciking the js but using splie method; we create a new function this time which creates the sense that foreach loop is being used for nodelist 
           
          
           nodeListForeach(fields, function(current, index){
              if(percentages[index] > 0){
                 current.textContent = percentages[index] + '%';
              }else{
                 current.textContent = '---';
                }
               
            });
           
      },
       
       formatNumber: function (num, type){
           
           /*
           + or - before num(inc or exp)
           exactly two decimal points
           comma separating the thoudands
           
           2390.4567 -> 2,390.45
           2000 -> 2,000.00
           */
           
           var numSplit, dec, int, type;
           num = Math.abs(num); //changed to string
           num = num.toFixed(2);  //changed to string
           
           numSplit = num.split('.');
           
           int = numSplit[0];
           if(int.length > 3 && int.length <6){
               int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
           }
           //else if(int.length > 5){
           //    int = int.substr(0, int.length-5) + ',' + int.substr(int.length-5, 2) + ',' + int.substr(int.length-5, 3);
           //}
           dec = numSplit[1];
           
           return (type === 'exp' ? '-' :  '+') + ' ' + int + '.' + dec;
           /*
           type === 'exp' ? sign = '-' : sign = '+';
           return type + ' ' + int + dec;
           */
       },
       
       dsiplayDate : function(){
           var now, year, month;
           
           var months = ['January', 'February', 'March','April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'Decemeber'];
           
           now =new Date(); //use predined Date constructor
           
           year = now.getFullYear();
           month = now.getMonth(); //Zero based i.e jan is month 1 
           
           document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
       },
       
       changedType : function(){
           var fields = document.querySelectorAll(
               DOMStrings.inputType + ',' +
               DOMStrings.inputDescription + ',' +
               DOMStrings.inputValue 
           );
           nodeListForeach(fields, function(cur){
               cur.classList.toggle('red-focus');
           });
           
           document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
       },
       
       getDOMStrings : function(){ //making it public so can other controlers can also use these 
           return DOMStrings;
            }
         };
    })();


//GLOBAL APP CONTROLLER
var appController = (function(budgetCtrl,UICtrl){
    
    var setupEventListeners = function(){
          var DOM = UICtrl.getDOMStrings(); //using DOMStrigs defined in UIController
          
          document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
    //We also want all this to happen when we press enter instead of clicking on add button
    //Need to use keypress event listener for that . That won't be added to any specific element instead will be added to global page
    //Keyboard event
          document.addEventListener('keypress',function(event){  //keypress is for any key except ALT, CTRL, SHIFT, ESC
        
        if(event.keyCode === 13 || event.which ===13){  //key code of Enter . Some browsers use which instead of keycode
            //console.log("Enter was pressed");
            ctrlAddItem();
          }
       });
        
        //to delet the elemnt be in income or expense. We use event delegation and hence we rae setting up the event listener in the parent class of both income and expense
        document.querySelector(DOM.container).addEventListener('click', ctrlDeletItem);
        
        //To chane color to red when working on exp
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
     
    };
    
    var updateBudget = function(){
         
        //Calculate the budget
        budgetCtrl.calculateBudget();
        
        //Return the budget
       var budget = budgetCtrl.getBudget();
        
        //Display the budget on the UI
        UICtrl.displayBudget(budget);
        //console.log(budget);
    };
   
    var updatePercentages = function(){
         
        //Calculate the percentages
        budgetCtrl.calculatePercentage();
        
        //Read percentage from the budget controller 
       var percentages = budgetCtrl.getPercentage();
        
        //Update the UI with the new %
        UICtrl.displayPercentages(percentages);
        //console.log(percentages);
    };
    
   var ctrlAddItem = function(){
        
        //Get the field input data
        var input = UICtrl.getInput();
        
       //Only if dec and value are not blank and val is not zero should the item be added
       if(input.description !== "" && input.value >0 && !isNaN(input.value)){
         
        //Add the item to budget controller
         var newItem = budgetCtrl.addItem(input.type, input.description, input.value); //parameters from getInput()
         
        //Add the item to user interface
         UICtrl.addListItem(newItem, input.type);
         
        //Clear the input fields
        UICtrl.clearFields();
       
       //Calculate and Update Budget
       updateBudget();
           
       //Calculate and update percentages   
       updatePercentages();
     }
   };
    
  var ctrlDeletItem =function(event){
        var itemID, splitID, type, ID;
         
        //console.log(event.target); return ion-ios-close-outline i.e the button which for which the event is made .
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id //to get the id of the parent
        
        if(itemID){ //take advantage of fact that only this particular html element has id and use it to delete income and expense entries
            
            //ItemID is something like inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); //converted string "1" to number 1
            
            //Delete item from DS
            budgetController.deleteItem(type, ID);
            
            //Delete item from UI
            UICtrl.deleteListItem(itemID);
            
            //Update and display
            updateBudget();
            
            //Calculate and update percentages   
            updatePercentages();
        }
      
    };
    
   
    //need to return function setupEventListeners so can thta the evnt listeners can be executed as soon as code starts. 
   return {
       init : function(){
           console.log("Application has started");
           //window.location.reload()
           
          window.onload = function() {   //to empty the fileds desc and value when we refersh
          document.querySelector('.add__description').value = '';
          document.querySelector('.add__value').value = '';
         }
          
           UICtrl.dsiplayDate();
           UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
              
           });
           setupEventListeners();  //making the function public
       }
   }
     
})(budgetController,UIController);

appController.init(); //only code outside modules ; used to initialize the code. 












