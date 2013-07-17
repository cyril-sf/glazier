module("Github::Stars Acceptances");

import Conductor from 'conductor';
import { inCard, TestService } from 'helpers/card_test_helpers';

var conductor, card;

if (/phantom/i.test(navigator.userAgent)) { return; }

module("Github::Stars Acceptances", {
  setup: function() {

    conductor = new Conductor({
      testing: true,
      conductorURL: '/vendor/conductor.js.html'
    });

    Conductor.services['test'] = TestService;

    Conductor.services['unauthenticatedGithubApi'] = Conductor.Oasis.Service.extend({
      requests: {
        ajax: function(promise, ajaxOpts) {
          promise.resolve({ meta: {}, data: [] });
        }
      }
    });

    conductor.loadData('/cards/glazier-github-stars/card.js', 1, { user: null, repositoryName: 'emberjs/ember.js' });
    card = conductor.load('/cards/glazier-github-stars/card.js', 1, {
      capabilities: ['test', 'repository', 'identity', 'authenticatedGithubApi', 'unauthenticatedGithubApi']
    });

    card.promise.then(null, Conductor.error);
    card.appendTo('#qunit-fixture');
  },

  teardown: function() {

  }
});

asyncTest("it renders", 1, function(){
  inCard(card, function(card, resolver){
    function fail(e) {
      ok(false, e);
      resolver.reject();
    }
    function wait() {
      var promise, obj = {}, helperName;

      return new Ember.RSVP.Promise(function(resolve) {
        var watcher = setInterval(function() {
          var routerIsLoading = card.App.__container__.lookup('router:main').router.isLoading;
          if (routerIsLoading) { return; }
          if (Ember.run.hasScheduledTimers() || Ember.run.currentRunLoop) { return; }
          clearInterval(watcher);
          Ember.run(function() {
            resolve();
          });
        }, 10);
      });
    }
    card.render();
    card.App.then(function(){
      wait().then(function(){
        equal($('h3').text(), 'Github Stargazers for emberjs/ember.js');
        start();
        resolver.resolve();
      }).then(null, fail);
    }, fail);
  }).then(null, console.error);
});
