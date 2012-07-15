var colors = d3.scale.category20();

var gscale = d3.scale.linear().domain([5,50]).range([.1,.25]);


SimpleBubble = function(d, id, c, bs) {
  this.data = d;
  this.id = id;
  this.canvas = c;
  this.el = null;
  this.x = 0;
  this.y = 0;
  this.radius = 0;
  this.boxSize = 0;
  this.isDragging = false;
  this.isSelected = false;
  this.tooltip = null;
  this.bscale = bs; 

  this.init();
};

SimpleBubble.prototype.init = function() {
  /* Elements that make up the bubbles display*/
  this.el = $("<div class='bubble' id='bubble-" + this.id + "'></div>");
  this.elFill = $("<div class='bubbleFill'></div>");
  this.el.append(this.elFill);

  /* Attach mouse interaction to root element */
  /* Note use of $.proxy to maintain context */
  this.el.on('hover', $.proxy(this.showToolTip, this));
  this.el.on('mouseout', $.proxy(this.hideToolTip, this));

  /* Set CSS of Elements  */
  this.radius = this.bscale(this.data.followers_count);
  this.boxSize = this.bscale(this.data.followers_count);

  this.elFill.css({
    width: this.boxSize,
    height: this.boxSize,
    left: -this.boxSize / 2,
    top: -this.boxSize / 2,
    "background-color": colors(this.data.followers_count),
    "border-radius" : this.boxSize/2
    });
    
};

SimpleBubble.prototype.showToolTip = function() {
  var self = this;
  var toolWidth = 40;
  var toolHeight = 25;
  this.tooltip =  $("<div class='tooltip'></div>");
  this.tooltip.html("<div class='tooltipFill'><p>Twitter Handle: " + this.data.screen_name + "</p><p># Followers:"+this.data.followers_count+"</p></div>");
  $('#bubble-'+this.id).mousemove(function(e){
    self.tooltip.css({
      left: 0 ,
      top: 0, 
    });
    self.canvas.append(self.tooltip);
   })
  
};

SimpleBubble.prototype.hideToolTip = function() {
  $(".tooltip").remove();
  // this.tooltip = null;
};

SimpleBubble.prototype.move = function() {
  this.el.css({top: this.y, left:this.x});
};

SimpleVis = function(container,d) {
  this.width = 712;
  this.height = 800;
  this.canvas = $(container);
  this.data = d;
  this.force = null;
  this.bubbles = [];
  this.centers = [
  {x: 356, y:400}
  ];


  var m = _.max(data, function(d){return d.followers_count});

  this.bs = d3.scale.linear().domain([8,  m.followers_count]).range([30,300]);

  this.bubbleCharge = function(d) {
    return -Math.pow(d.radius,2.0) / 8;
  };

  this.init();
};

SimpleVis.prototype.init = function() {
  /* Store reference to original this */
  var me = this;

  /* Initialize root visualization element */
  this.canvas.css({
    width: this.width,
    height: this.height,
    "background-color": "#eee",
    position: "relative"});

  /* Create Bubbles */
  for(var i=0; i< this.data.length; i++) {
    var b = new SimpleBubble(this.data[i], i, this.canvas, this.bs);
    /* Define Starting locations */
    b.x = b.boxSize + (20 * (i+1));
    b.y = b.boxSize + (10 * (i+1));
    this.bubbles.push(b);
    /* Add root bubble element to visualization */
    this.canvas.append(b.el);
  };

  /* Setup force layout */
  this.force = d3.layout.force()
    .nodes(this.bubbles)
    .gravity(.08)
    .charge(this.bubbleCharge)
    .friction(0.6)
    .size([this.width, this.height])
    .on("tick", function(e) {
      me.bubbles.forEach( function(b) {
        me.setBubbleLocation(b, e.alpha, me.centers);
        b.move();
      });
    });

  this.force.start();
};

SimpleVis.prototype.setBubbleLocation = function(bubble, alpha, centers) {
  var center = centers[0];
  bubble.y = bubble.y + (center.y - bubble.y) * (0.115) * alpha;
  bubble.x = bubble.x + (center.x - bubble.x) * (0.115) * alpha;
};


