/**
 * Created by cburkhardt on 28.04.2015.
 */
UI.registerHelper('formatTime', function(context, options) {
    if(context)
        return moment(context).format('DD.MM.YY hh:mm');
});

UI.registerHelper('formatNumber', function(context, options) {
    if(context)
        context = context.toFixed(2) + '';
        x = context.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
});
