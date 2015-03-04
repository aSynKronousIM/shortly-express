Shortly.LogoutView = Backbone.View.extend({
  className: 'logout',

  template: Templates['logout'],

  initialize: function(){
    this.render();
  },

  render: function() {
    this.$el.html( this.template() );
    return this;
  }
});