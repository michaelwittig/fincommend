/**
 * Created by tullius on 14.06.15.
 */
Template.settings.events({
    "change #timebudget": function(evt) {
        var newValue = $(evt.target).val().replace("min", ""); ;
        var oldValue = Session.get("timebudget");
        if (newValue != oldValue) {
            // value changed, let's do something
        }
        Session.set("actualTime", newValue);
    }
});