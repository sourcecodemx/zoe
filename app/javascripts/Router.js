/*global define, Backbone, aspect, _, User */

define([
  'Page',
  'Redirect'
], function (Page, Redirect) {
  'use strict';

  console.log('Redirect', Redirect);

  var AppRouter = Backbone.Router.extend({
    currentView: null,
    routes: {
      'home' : 'home',
      'index': 'index',
      'about': 'about',
      'blog': 'blog',
      'gallery': 'gallery',
      'premier': 'premier',
      'pos': 'pos',
      'store': 'store',

      //Default Route
      '*path': 'home'
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
        .omit(function(v){return v === 'profile';})
        .toArray()
        .value();

      //Will close current view if any
      var beforeAll = function(){
        if (this.currentView instanceof Backbone.View) {
          // For order page we will skip this handling
          console.log(this.currentView.id, 'hide');
          this.currentView.hide();
          this.currentView = null;
        }

        window.scrollTo(0,0);
      }.bind(this);

      //Execute "beforeAll" function before all pages
      aspect.add(this, pages, beforeAll);

      //Will be executed after all pages
      var afterAll = function(){
        console.log(this.currentView.id, 'show');
        this.currentView.show();
      }.bind(this);
      //Execute after all pages
      aspect.add(this, routes, afterAll, 'after');
      
      //Following pages require user to be logged in
      var authPages = ['home', 'blog', 'gallery', 'pos', 'premier', 'settings', 'stats'];
      var beforeAuth = function(){
        if(User.current()){
          return true;
        }

        throw new Redirect('login');
      }.bind(this);
      //Execute before all auth-only controllers
      aspect.add(this, authPages, beforeAuth);

      //Pages that won't be show if user is authenticated
      var nonAuth = ['auth', 'forgot', 'login', 'password', 'signup', 'signupWeight'];
      var beforeNonAuth = function(){
        if(User.current()){
          throw new Redirect('home');
        }

        return true;
      }.bind(this);
      //Execute before all controllers excluded to auth users
      aspect.add(this, nonAuth, beforeNonAuth);
    },

    initialize: function(){
      console.log('initialize router');
    },

    start: function(){
      Backbone.history.start({
        root: '/'
      });
    },

    index: function () {
      if (!this.indexView) {
        this.indexView = new Page.Auth();
      }

      this.currentView = this.indexView;
    },

    home: function () {
      if (!this.homeView) {
        this.homeView = new Page.Home();
      }

      this.currentView = this.homeView;
    },

    about: function () {
      if (!this.aboutView) {
        this.aboutView = new Page.About();
      }

      this.currentView = this.aboutView;
    },

    blog: function () {
      if (!this.blogView) {
        this.blogView = new Page.Blog();
      }

      this.currentView = this.blogView;
    },

    gallery: function () {
      try{
        if (!this.galleryView) {
          this.galleryView = new Page.Gallery();
        }

        this.currentView = this.galleryView;
      }catch(e){
        console.log(e, e.stack, e.message);
      }
    },

    premier: function () {
      if (!this.premierView) {
        this.premierView = new Page.Premier();
      }

      this.currentView = this.premierView;
    },

    pos: function () {
      if (!this.posView) {
        this.posView = new Page.Pos();
      }

      this.currentView = this.posView;
    },

    store: function () {
      if (!this.storeView) {
        this.storeView = new Page.Store();
      }

      this.currentView = this.storeView;
    }
  });

  return AppRouter;
});