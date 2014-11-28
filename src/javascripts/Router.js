/*global define, Backbone, aspect, _, User, forge */

define([
  'Page',
  'Header',
  'ShareModal'
], function (Page, Header, ShareModal) {
  'use strict';

  var AppRouter = Backbone.Router.extend({
    currentView: null,
    routes: {
      'home'     : 'home',
      'home/:b'  : 'home',
      'index'    : 'index',
      'index/:b' : 'index',
      'about'    : 'about',
      'blog'     : 'blog',
      'gallery'  : 'gallery',
      'premier'  : 'premier',
      'pos'      : 'pos',
      'store'    : 'store',
      'share/:message'    : 'share'
    },

    /**
    * Overridden because of aspects.
    *
    * @overridden
    */
    _bindRoutes: function () {
      if (!this.routes) {
        return;
      }

      // Added only this method call to orginal _bindRoutes.
      // The reason of that is to decorated original route handlers.
      this.addAspectsToRoutes();

      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    /**
    * Decorate routes for different purposes, I'm trying to avoid
    * repeating ourselves for repetitive tasks, like: 
    * - killing views on route changes
    * - updating Google Analytics
    * - updating user session's timestamp
    * - bootstraping those views that require an authenticated user
    *   to be displayed
    * etc...
    */
    addAspectsToRoutes: function(){
      //Grab unique route values
      var routes = _.unique(_.values(this.routes));

      // Leave !profile route out of the pages array, it is not a page
      // but a modal
      var pages = _
        .chain(routes)
        .omit(function(v){return v === 'share';})
        .toArray()
        .value();

      //Will close current view if any
      var beforeAll = function(){
        if (this.currentView instanceof Backbone.View) {
          // For order page we will skip this handling
          this.currentView.hide();
          this.currentView = null;
        }

        window.scrollTo(0,0);
      }.bind(this);

      //Execute "beforeAll" function before all pages
      aspect.add(this, pages, beforeAll);

      var rootPages = ['home', 'blog', 'gallery', 'about', 'pos', 'premier', 'store'];
      var beforeRoot = function(){
        this.header = this.constructor.getHeader();
        this.header.hide();
      }.bind(this);
      //Execute before all auth-only controllers
      aspect.add(this, rootPages, beforeRoot);
    },

    initialize: function(){
      forge.parse.setBadgeNumber(0);
      //Start history
      Backbone.history.start({
        root: '/'
      });

      if(User.current()){
        Backbone.history.navigate('#home', {trigger: true});
      }else{
        Backbone.history.navigate('#index', {trigger: true});
      }

      var onLogout = function(){
        this.homeView.empty();
        Backbone.history.navigate('#index/bounceInLeft', {trigger: true});
      }.bind(this);

      var onLogin = function(signup){
        if(this.homeView){
          this.homeView.reload();
          Backbone.history.navigate('#home/bounceInLeft', {trigger: true});
        }else{
          Backbone.history.navigate('#home', {trigger: true});
        }

        if(signup){
          if(this.weightView){
            this.weightView.show();
          }else{
            this.weightView = new Page.Weight().show();
          }
        }
      }.bind(this);

      Backbone.on('user:logout', onLogout);
      Backbone.on('user:login', onLogin);
      Backbone.on('share', this.share.bind(this));

      //Hid esplash screen
      forge.launchimage.hide();
    },

    index: function (bounce) {
      if (!this.indexView) {
        this.indexView = new Page.Auth();
      }

      this.currentView = this.indexView.show();

      switch(bounce){
      case 'bounceInLeft':
        this.currentView.bounceInLeft();
        break;
      }
    },

    home: function (bounce) {
      if (!this.homeView) {
        this.homeView = new Page.Home();
      }

      this.currentView = this.homeView.show();

      switch(bounce){
      case 'bounceInLeft':
        this.currentView.bounceInLeft();
        break;
      }
    },

    about: function () {
      if (!this.aboutView) {
        this.aboutView = new Page.About();
      }

      this.currentView = this.aboutView.show();
    },

    blog: function () {
      if (!this.blogView) {
        this.blogView = new Page.Blog();
      }

      this.currentView = this.blogView.show();
    },

    gallery: function () {
      if (!this.galleryView) {
        this.galleryView = new Page.Gallery();
      }

      this.currentView = this.galleryView.show();
    },

    premier: function () {
      if (!this.premierView) {
        this.premierView = new Page.Premier();
      }

      this.currentView = this.premierView.show();
    },

    pos: function () {
      require(['Pos'], function(View){
        if (!this.posView) {
          this.posView = new View();
        }

        this.currentView = this.posView.show();
      }.bind(this));
    },

    store: function () {
      if (!this.storeView) {
        this.storeView = new Page.Store();
      }

      this.currentView = this.storeView.show();
    },
    share: function(m, period, username, consumption, goal){
      if(!m && !_.isString(m)){
        return;
      }

      this.currentView.shareModal = this.constructor.share(m, period, username, consumption, goal);
    }
  }, {
    getHeader: function(){
      if(!this._header){
        this._header = new Header();
        $('body').prepend(this._header.$el);
      }

      return this._header;
    },
    share: function(m, period, username, consumption, goal){
      if(!this._shareModal){
        this._shareModal = new ShareModal();
      }

      return this._shareModal.show(m, period, username, consumption, goal);
    }
  });

  return AppRouter;
});