Meteor.startup(function () {

    if (Meteor.users.find().count() === 0) {
        Accounts.createUser({
            username: 'test',
            email: 'test@test.de',
            password: 'test1234',
            profile: {
               firstName: 'Max',
                lastName: 'MusterMann'
            }
        });
        Accounts.createUser({
            username: 'mwittig',
            email: 'mwittig@widdix.de',
            password: 'test1234',
            profile: {
                firstName: 'Michael',
                lastName: 'Wittig'
            }
        });
        Accounts.createUser({
            username: 'cburkhardt',
            email: 'cburkhardt@cinovo.de',
            password: 'test1234',
            profile: {
                firstName: 'Christian',
                lastName: 'Burkhardt'
            }
        });
        Accounts.createUser({
            username: 'blebherz',
            email: 'mwittig@test.de',
            password: 'test1234',
            profile: {
                firstName: 'Ben',
                lastName: 'Lebherz'
            }
        });
        Accounts.createUser({
            username: 'oschoch',
            email: 'shofox@gmail.de',
            password: 'test1234',
            profile: {
                firstName: 'Oliver',
                lastName: 'Schoch'
            }
        });
        Accounts.createUser({
            username: 'mkibanov',
            email: 'kibanov@gmail.de',
            password: 'test1234',
            profile: {
                firstName: 'Mark',
                lastName: 'Kibanov'
            }
        });
    }
});