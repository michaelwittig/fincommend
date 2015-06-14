/**
 * Created by tullius on 13.06.15.
 */
Template.index.events({
    'click': function(event){
        console.log("You clicked anything");
    },
    'click .minus': function(event){
        console.log(event);
        event.target.style.color = 'yellow'
    },
    'click .plus': function(event){
        console.log("You clicked minus");
    },
    'click .checked': function(event){
        console.log("You clicked checked");
        actualTime = Session.get('actualTime');
        if(actualTime > 0) {
            actualTime = Session.get('actualTime') - 1;
        }
        Session.set('actualTime', actualTime);
        event.target.style.color = '#EFC94C'
    }
});

Template.index.helpers({
    'actualTime': function(){
        if(!Session.get('actualTime')){
            Session.set('actualTime', 10);
        }
        return Session.get('actualTime')
    }
});

