Shortly.SignUpView = Backbone.View.extend({
  className: 'signup',

  template: Templates['signup'],

  initialize: function(){
    this.render();
  },

  render: function() {
    this.$el.html( this.template() );
    return this;
  }
});