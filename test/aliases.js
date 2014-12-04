/* jshint strict: false */
/* global pack: true */

var rootName = 'aliases';
var hie = new pack({ name: rootName });

var aliases = ['alias-1', 'alias-2', 'alias-3'];
it('should be have aliases', function(){
  hie(['command'].concat(aliases)).get('orig')
    .should.have
    .property('aliases', {
      'alias-1': 'command',
      'alias-2': 'command',
      'alias-3': 'command'
    });
});

it('aliases should go to original command', function(){
  hie.get('alias-1')
    .should.have.property('name', 'command');

  hie.get('alias-2')
    .should.have.property('name', 'command');

  hie.get('alias-3')
    .should.have.property('name', 'command');
});
