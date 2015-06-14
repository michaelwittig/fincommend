/**
 * Created by tullius on 13.06.15.
 */
Template.infos.events({
    'click': function(){
        console.log("You clicked anything");
    },
    'click .minus': function(){
        console.log("You clicked minus");
    },
    'click .checked': function(){
        console.log("You clicked checked");
    }
});
