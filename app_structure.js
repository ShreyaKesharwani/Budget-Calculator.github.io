var budgetController = (function(){
    
    var x = 23;  //private
    var add=function(a){  //private
        return x+a;
    } //function and x var are in closure
    return {
        publictest:function(b){  //public
            return add(b);
        }
    }//publictest method can access add and x even after function has ene returned coz if closures 
})();


var UIController = (function(){
    
    //document.querySelector('.add__btn').addEventListener('click',initialize);
    
})();


var appController = (function(budgetCtrl,UICtrl){
     
    var z = budgetController.publictest(5);
    
    return {  //only way to make z accessible from outside
        anotherPublic : function(){
            console.log(z);
        }
    }
    
})(budgetController,UIController);
