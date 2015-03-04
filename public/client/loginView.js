Shortly.LoginView = Backbone.View.extend({
  className: 'login',

  template: Templates['login'],


  initialize: function(){
    this.render();
  },

  render: function() {
    this.$el.html( this.template() );
    return this;
  }
});