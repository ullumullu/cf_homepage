var infoCircle = angular.module('InfoCircle', []);



infoCircle.directive('infocircle', ['$window', '$compile', function($window, $compile){
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {
      items: "@",
      prev: "&",
      next: "&",
      width: "=",
      height: "="
    },
    // controller: function($scope, $element, $attrs, $transclude) {},
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
    template: '',
    // templateUrl: '',
    // replace: true,
    transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, iAttrs, controller, transcludeFn) {
      var width = $scope.width || iElm.parent().width();
      var height = $scope.height || '100%';
      iElm.css('display', 'block');
      iElm.css('width', width);
      iElm.css('height', height);
      // iElm.css('background-color', 'grey');
      iElm.append("Height: " + iElm.height());
      iElm.append("Width: " + iElm.width());

      function Plot ( stage ) {
        this.setDimensions = function( x, y ) {
          this.elm.style.width = x + 'px';
          this.elm.style.height = y + 'px';
          this.width = x;
          this.height = y;
        };
        this.position = function( x, y ) {
          var xoffset = arguments[2] ? 0 : this.width / 2;
          var yoffset = arguments[2] ? 0 : this.height / 2;
          this.elm.style.left = (x - xoffset) + 'px';
          this.elm.style.top = (y - yoffset) + 'px';
          this.x = x;
          this.y = y;
        };
        this.setBackground = function( col ) {
          this.elm.style.background = col;
        };
        this.kill = function() {
          stage.removeChild( this.elm );
        };
        this.rotate = function( str ) {
          this.elm.style.webkitTransform = this.elm.style.MozTransform = 
          this.elm.style.OTransform = this.elm.style.transform = 
          'rotate(' + str + ')'; 
        };
        this.content = function( content ) {
          this.elm.innerHTML = content;
        };
        this.round = function( round ) {
          this.elm.style.borderRadius = round ? '50% 50%' : '';
        };
        this.elm = document.createElement( 'div' );
        this.elm.style.position = 'absolute';
        stage.appendChild( this.elm );
    };

    var plots = 8,
        increase = Math.PI * 2 / plots,
        angle = 0,
        x = 0,
        y = 0,
        size = (iElm.width() > iElm.height() ? iElm.height(): iElm.width()),
        radius = size*0.4,
        dimension = size*0.2,
        center_x = iElm.width()/2,
        center_y = iElm.height()/2;

    $scope.item = {};    
    $scope.item.name = "Sven Sterbling";
    transcludeFn($scope, function(clone, scope) {
      var c = new Plot(iElm[0]);
      c.setDimensions(size*0.4, size*0.4);
      x = center_x;
      y = center_y;
      c.position( x,y );
      console.log(clone);
      c.content(clone[1].innerHTML);
    });
    
    for( var i = 0; i < plots; i++ ) {
      var p = new Plot( iElm[0] );
      p.setDimensions( dimension, dimension );
      p.round(false);
      x = radius * Math.cos( angle ) + center_x;
      y = radius * Math.sin( angle ) + center_y;
      p.position( x,y );
      angle += increase;
      p.content('<img class="white" src="./../img/articles/53d7f2bdaa78e0e40f42dbc2.png" width="'+dimension+'" height="'+dimension+'"></img>');
    }

      $compile(iElm.contents())($scope);
    }
  };
}]);