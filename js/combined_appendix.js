/**
    The base class for all elements that appear in the game.
    @author <a href="mailto:matthewcasperson@gmail.com">Matthew Casperson</a>
    @class
*/
function GameObject()
{
    /** Display depth order. A smaller zOrder means the element is rendered first, and therefor
        in the background.
        @type Number
    */
    this.zOrder = 0;
    /**
        The position on the X axis
        @type Number
    */
    this.x = 0;
    /**
        The position on the Y axis
        @type Number
    */
    this.y = 0;
    
    /**
        Initialises the object, and adds it to the list of objects held by the GameObjectManager.
        @param x        The position on the X axis
        @param y        The position on the Y axis
        @param z        The z order of the element (elements in the background have a lower z value)
    */
    this.startupGameObject = function(/**Number*/ x, /**Number*/ y, /**Number*/ z)
    {
        this.zOrder = z;
        this.x = x;
        this.y = y;
        g_GameObjectManager.addGameObject(this);
        return this;
    }
    
    /**
        Cleans up the object, and removes it from the list of objects held by the GameObjectManager.
    */
    this.shutdownGameObject = function()
    {
        g_GameObjectManager.removeGameObject(this);
    }
}
/**
    The base class for all elements that appear in the game.
    @author <a href="mailto:matthewcasperson@gmail.com">Matthew Casperson</a>
    @class
*/
function VisualGameObject()
{
    /**
        The image that will be displayed by this object
        @type Image
    */
    this.image = null;
    
    /**
        Draws this element to the back buffer
        @param dt Time in seconds since the last frame
		@param context The context to draw to
		@param xScroll The global scrolling value of the x axis  
		@param yScroll The global scrolling value of the y axis  
    */
    this.draw = function(/**Number*/ dt, /**CanvasRenderingContext2D*/ context, /**Number*/ xScroll, /**Number*/ yScroll)
    {
        context.drawImage(this.image, this.x - xScroll, this.y - yScroll);
    }
    
    /**
        Initialises this object
        @param image The image to be displayed
		@param x The position on the X axis
        @param y The position on the Y axis
		@param z The depth
    */
    this.startupVisualGameObject = function(/**Image*/ image, /**Number*/ x, /**Number*/ y, /**Number*/ z)
    {
        this.startupGameObject(x, y, z);
        this.image = image;
        return this;
    }
    
    /**
        Clean this object up
    */
    this.shutdownVisualGameObject = function()
    {
        this.shutdownGameObject();
    }
}
VisualGameObject.prototype = new GameObject;

/**
    A class that display a repeating texture that can optionall be offset in either
	the x or y axis
    @author <a href="mailto:matthewcasperson@gmail.com">Matthew Casperson</a>
    @class
*/
function RepeatingGameObject()
{
    /** The width that the final image will take up
		@type Number
	*/
	this.width = 0;
	/** The height that the final image will take up
		@type Number
	*/
    this.height = 0;
	/** How much of the scrollX and scrollY to apply when drawing
		@type Number
	*/
    this.scrollFactor = 1;
	
    /**
        Initialises this object
        @return A reference to the initialised object
    */
    this.startupRepeatingGameObject = function(image, x, y, z, width, height, scrollFactor)
    {
        this.startupVisualGameObject(image, x, y, z);
        this.width = width;
        this.height = height;
        this.scrollFactor = scrollFactor;
        return this;
    }
	
    /**
        Clean this object up
    */
    this.shutdownstartupRepeatingGameObject = function()
    {
        this.shutdownVisualGameObject();
    }
    
	/**
        Draws this element to the back buffer
        @param dt Time in seconds since the last frame
		@param context The context to draw to
		@param xScroll The global scrolling value of the x axis  
		@param yScroll The global scrolling value of the y axis  
    */
    this.draw = function(dt, canvas, xScroll, yScroll)
    {
        var areaDrawn = [0, 0];
        
        for (var y = 0; y < this.height; y += areaDrawn[1])
        {
            for (var x = 0; x < this.width; x += areaDrawn[0])
            {
                // the top left corner to start drawing the next tile from
				var newPosition = [this.x + x, this.y + y];
				// the amount of space left in which to draw
                var newFillArea = [this.width - x, this.height - y];
				// the first time around you have to start drawing from the middle of the image
				// subsequent tiles alwyas get drawn from the top or left
                var newScrollPosition = [0, 0];
                if (x==0) newScrollPosition[0] = xScroll * this.scrollFactor;
                if (y==0) newScrollPosition[1] = yScroll * this.scrollFactor;
                areaDrawn = this.drawRepeat(canvas, newPosition, newFillArea, newScrollPosition);
            }
        }
    }
    
    this.drawRepeat = function(canvas, newPosition, newFillArea, newScrollPosition)
    {
        // find where in our repeating texture to start drawing (the top left corner)
        var xOffset = Math.abs(newScrollPosition[0]) % this.image.width;
        var yOffset = Math.abs(newScrollPosition[1]) % this.image.height;
        var left = newScrollPosition[0]<0?this.image.width-xOffset:xOffset;
        var top = newScrollPosition[1]<0?this.image.height-yOffset:yOffset;
        var width = newFillArea[0] < this.image.width-left?newFillArea[0]:this.image.width-left;
        var height = newFillArea[1] < this.image.height-top?newFillArea[1]:this.image.height-top;
        
        // draw the image
        canvas.drawImage(this.image, left, top, width, height, newPosition[0], newPosition[1], width, height);
        
        return [width, height];
    }
    
    
}
RepeatingGameObject.prototype = new VisualGameObject();

/**
    Displays an animated Game Object
    @author <a href="mailto:matthewcasperson@gmail.com">Matthew Casperson</a>
    @class
*/
function AnimatedGameObject()
{
    /**
        Defines the current frame that is to be rendered
        @type Number
     */
    this.currentFrame = 0;
    /**
        Defines the frames per second of the animation
        @type Number
     */
    this.timeBetweenFrames = 0;
    /**
        The number of individual frames held in the image
        @type Number
     */
    /**
        Time until the next frame
        @type number
     */
    this.timeSinceLastFrame = 0;
    /**
        The width of each individual frame
        @type Number
     */
    this.frameWidth = 0;

    /**
        Initialises this object
        @param image The image to be displayed
		@param x The position on the X axis
        @param y The position on the Y axis
		@param z The depth
        @param frameCount The number of animation frames in the image
        @param fps The frames per second to animate this object at
    */
    this.startupAnimatedGameObject = function(/**Image*/ image, /**Number*/ x, /**Number*/ y, /**Number*/ z, /**Number*/ frameCount, /**Number*/ fps)
    {
        if (frameCount <= 0) throw "framecount can not be <= 0";
        if (fps <= 0) throw "fps can not be <= 0"

        this.startupVisualGameObject(image, x, y, z);
        this.currentFrame = 0;
        this.frameCount = frameCount;
        this.timeBetweenFrames = 1/fps;
        this.timeSinceLastFrame = this.timeBetweenFrames;
        this.frameWidth = this.image.width / this.frameCount;
    }

    /**
        Draws this element to the back buffer
        @param dt Time in seconds since the last frame
		@param context The context to draw to
		@param xScroll The global scrolling value of the x axis
		@param yScroll The global scrolling value of the y axis
    */
    this.draw = function(/**Number*/ dt, /**CanvasRenderingContext2D*/ context, /**Number*/ xScroll, /**Number*/ yScroll)
    {
        var sourceX = this.frameWidth * this.currentFrame;
        context.drawImage(this.image, sourceX, 0, this.frameWidth, this.image.height, this.x - xScroll, this.y - yScroll, this.frameWidth, this.image.height);

        this.timeSinceLastFrame -= dt;
        if (this.timeSinceLastFrame <= 0)
        {
           this.timeSinceLastFrame = this.timeBetweenFrames;
           ++this.currentFrame;
           this.currentFrame %= this.frameCount;
        }
    }
}

AnimatedGameObject.prototype = new VisualGameObject;
/**
    Removes a number of objects from the array
    @param from The first object to remove
    @param to (Optional) The last object to remove
*/
Array.prototype.remove = function(/**Number*/ from, /**Number*/ to)
{
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/**
    Removes a specific object from the array
    @param object The object to remove
*/
Array.prototype.removeObject = function(object)
{
    for (var i = 0; i < this.length; ++i)
    {
        if (this[i] === object)
        {
            this.remove(i);
            break;
        }
    }
}
/**
    The ApplicationManager is used to manage the application itself.
    @author <a href="mailto:matthewcasperson@gmail.com">Matthew Casperson</a>
    @class
*/
function ApplicationManager()
{
    /**
        Initialises this object
        @return A reference to the initialised object
    */
    this.startupApplicationManager = function()
    {
		this.runner = new AnimatedGameObject().startupAnimatedGameObject(g_run, 0, 0, 1, cTotalFrames, FPS);
        return this;
    }
}
/**
    A manager for all the objects in the game
    @author <a href="mailto:matthewcasperson@gmail.com">Matthew Casperson</a>
    @class
*/
function GameObjectManager()
{
    /** An array of game objects 
        @type Arary
    */
    this.gameObjects = new Array();
    /** The time that the last frame was rendered  
        @type Date
    */
    this.lastFrame = new Date().getTime();
    /** The global scrolling value of the x axis  
        @type Number
    */
    this.xScroll = 0;
    /** The global scrolling value of the y axis  
        @type Number
    */
    this.yScroll = 0;
    /** A reference to the ApplicationManager instance  
        @type ApplicationManager
    */
    this.applicationManager = null;
    /** A reference to the canvas element  
        @type HTMLCanvasElement
    */
    this.canvas = null;
    /** A reference to the 2D context of the canvas element
        @type CanvasRenderingContext2D
    */
    this.context2D = null;
    /** A reference to the in-memory canvas used as a back buffer 
        @type HTMLCanvasElement
    */
    this.backBuffer = null;
    /** A reference to the backbuffer 2D context 
        @type CanvasRenderingContext2D
    */
    this.backBufferContext2D = null;

    /**
        Initialises this object
        @return A reference to the initialised object
    */
    this.startupGameObjectManager = function()
    {
        // set the global pointer to reference this object
        g_GameObjectManager = this;
        
        // get references to the canvas elements and their 2D contexts
        this.canvas = document.getElementById('canvas');
        this.context2D = this.canvas.getContext('2d');
        this.backBuffer = document.createElement('canvas');
        this.backBuffer.width = this.canvas.width;
        this.backBuffer.height = this.canvas.height;
        this.backBufferContext2D = this.backBuffer.getContext('2d');
        
        // create a new ApplicationManager
        this.applicationManager = new ApplicationManager().startupApplicationManager();
        
        // use setInterval to call the draw function 
        setInterval(function(){g_GameObjectManager.draw();}, SECONDS_BETWEEN_FRAMES);
        
        return this;        
    }
    
    /**
        The render loop
    */
    this.draw = function ()
    {
        // calculate the time since the last frame
        var thisFrame = new Date().getTime();
        var dt = (thisFrame - this.lastFrame)/1000;
        this.lastFrame = thisFrame;
        
        // clear the drawing contexts
        this.backBufferContext2D.clearRect(0, 0, this.backBuffer.width, this.backBuffer.height);
        this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // first update all the game objects
        for (x in this.gameObjects)
        {
            if (this.gameObjects[x].update)
            {
                this.gameObjects[x].update(dt, this.backBufferContext2D, this.xScroll, this.yScroll);
            }
        }

        // then draw the game objects
        for (x in this.gameObjects)
        {
            if (this.gameObjects[x].draw)
            {
                this.gameObjects[x].draw(dt, this.backBufferContext2D, this.xScroll, this.yScroll);
            }
        }
        
        // copy the back buffer to the displayed canvas
        this.context2D.drawImage(this.backBuffer, 0, 0);
    };
    
    /**
        Adds a new GameObject to the gameObjects collection
        @param gameObject The object to add
    */
    this.addGameObject = function(gameObject)
    {
        this.gameObjects.push(gameObject);
        this.gameObjects.sort(function(a,b){return a.zOrder - b.zOrder;})
    };
    
    /**
        Removes a GameObject from the gameObjects collection
        @param gameObject The object to remove
    */
    this.removeGameObject = function(gameObject)
    {
        this.gameObjects.removeObject(gameObject);
    }
}


function initCanvas()
{
    new GameObjectManager().startupGameObjectManager();
}
var cSpeed=9;
	var cWidth=60;
	var cHeight=60;
	var cTotalFrames=12;
	var cFrameWidth=60;
	var cImageSrc='images/sprites.gif';
	
	var cImageTimeout=false;
	
	function startAnimation(){
		
		document.getElementById('loaderImage').innerHTML='<canvas id="canvas" width="'+cWidth+'" height="'+cHeight+'"><p>Your browser does not support the canvas element.</p></canvas>';
		
		//FPS = Math.round(100/(maxSpeed+2-speed));
		FPS = Math.round(100/cSpeed);
		SECONDS_BETWEEN_FRAMES = 1 / FPS;
		g_GameObjectManager = null;
		g_run=genImage;

		g_run.width=cTotalFrames*cFrameWidth;
		genImage.onload=function (){cImageTimeout=setTimeout(fun, 0)};
		initCanvas();
	}
	
	
	function imageLoader(s, fun)//Pre-loads the sprites image
	{
		clearTimeout(cImageTimeout);
		cImageTimeout=0;
		genImage = new Image();
		genImage.onload=function (){cImageTimeout=setTimeout(fun, 0)};
		genImage.onerror=new Function('alert(\'Could not load the image\')');
		genImage.src=s;
	}
	
	//The following code starts the animation
	new imageLoader(cImageSrc, 'startAnimation()');
var $ = jQuery.noConflict();

$(document).ready(function($) {
	"use strict";

	//Preloader
	$(window).load(function(){
		$('.preloader').fadeOut('slow',function(){$(this).remove();});
	});
	
	// Login
	$('.fa-user').on('click', function() {
		$('.field-toggle').slideToggle(200);
	});


	/*

	// Read more on media body 
	$('.media-body p').readmore({
		speed: 75,
		maxHeight: 150
	});

	*/

	//Scroll Menu
	function menuToggle()
	{
		var windowWidth = $(window).width();

		if(windowWidth > 767 ){
			$(window).on('scroll', function(){
				if( $(window).scrollTop()>405 ){
					$('.navbar').addClass('navbar-fixed-top animated fadeIn');
					$('.navbar').removeClass('main-nav');
				} else {
					$('.navbar').removeClass('navbar-fixed-top');
					$('.navbar').addClass('main-nav');
				}
			});
		}else{
			
			$('.navbar').addClass('main-nav');
				
		};
		if(windowWidth > 767 ){
			$(window).on('scroll', function(){
				if( $(window).scrollTop()>405 ){
					$('.top-bar').addClass('top-bar-hide');
				} else {
					$('.top-bar').removeClass('top-bar-hide');
				}
			});
		}else{			
			$('.top-bar').addClass(this);				
		};
		
		if(windowWidth > 767 ){
			$(window).on('scroll', function(){
				if( $(window).scrollTop()>405 ){
					$('.navbar-brand').addClass('change-logo');
				} else {
					$('.navbar-brand').removeClass('change-logo');
				}
			});
		}else{			
			$('.navbar-brand').addClass(this);				
		}
				
	}

	menuToggle();

	// Navigation Scroll	
		
	$(window).scroll(function(event) {
		Scroll();
	});	
	
	$('.navbar-collapse ul li a').click(function() {  
		$('html, body').animate({scrollTop: $(this.hash).offset().top -79}, 1000);
		return false;
	});
	
	// User define function
	function Scroll() {
		var contentTop      =   [];
		var contentBottom   =   [];
		var winTop      =   $(window).scrollTop();
		var rangeTop    =   200;
		var rangeBottom =   500;
		$('.navbar-collapse').find('.scroll a').each(function(){
			contentTop.push( $( $(this).attr('href') ).offset().top);
			contentBottom.push( $( $(this).attr('href') ).offset().top + $( $(this).attr('href') ).height() );
		})
		$.each( contentTop, function(i){
			if ( winTop > contentTop[i] - rangeTop ){
				$('.navbar-collapse li.scroll')
				.removeClass('active')
				.eq(i).addClass('active');			
			}
		})

	};
	$(document).ready(function () {
		$(".navbar-nav li a").click(function(event) {
		$(".navbar-collapse").collapse('hide');
		});
	});
	
	//Parallax Scrolling
	$(window).bind('load', function () {
		parallaxInit();						  
	});
	function parallaxInit() {		
		$("#promo-one").parallax("50%", 0.3);
		$("#promo-two").parallax("50%", 0.3);
		$("#fun-fact").parallax("50%", 0.3);
		$("#news-letter").parallax("50%", 0.3);
		$("#twitter").parallax("50%", 0.3);	
	}	
	parallaxInit();			
		
	
	/**** Progress Bar ****/
	    
	$('.skill').appear();
	$('.skill').on('appear', loadCharts);

	function loadCharts() {
	    $('#circle-one').easyPieChart( {
			barColor: '#00558c',
			trackColor: '#0072bc',
			rotate: '0',
			lineCap: 'butt',
			scaleLength: '0',
			lineWidth: 32,
			size: 185
		});

		$('#circle-two').easyPieChart( {
			barColor: '#00558c',
			trackColor: '#0072bc',
			rotate: '0',
			lineCap: 'butt',
			scaleLength: '0',
			lineWidth: 32,
			size: 185
		} );

		$('#circle-three').easyPieChart( {
			barColor: '#00558c',
			trackColor: '#0072bc',
			rotate: '0',
			lineCap: 'butt',
			scaleLength: '0',
			lineWidth: 32,
			size: 185
		} );

		$('#circle-four').easyPieChart( {
			barColor: '#00558c',
			trackColor: '#0072bc',
			rotate: '0',
			lineCap: 'butt',
			scaleLength: '0',
			lineWidth: 32,
			size: 185
		} );
	}

	
	//Pretty Photo
	 $("a[data-gallery^='prettyPhoto']").prettyPhoto({
	  social_tools: false
	 });
	
	//Isotope
	var winDow = $(window);
			// Needed variables
	var $container=$('.portfolio-items');
	var $filter=$('.filter');

	try{
		$container.imagesLoaded( function(){
			$container.show();
			$container.isotope({
				filter:'*',
				layoutMode:'masonry',
				animationOptions:{
					duration:750,
					easing:'linear'
				}
			});
		});
	} catch(err) {
	}

	winDow.bind('resize', function(){
		var selector = $filter.find('a.active').attr('data-filter');

		try {
			$container.isotope({ 
				filter	: selector,
				animationOptions: {
					duration: 750,
					easing	: 'linear',
					queue	: false,
				}
			});
		} catch(err) {
		}
		return false;
	});
	
	// Isotope Filter 
	$filter.find('a').click(function(){
		var selector = $(this).attr('data-filter');

		try {
			$container.isotope({ 
				filter	: selector,
				animationOptions: {
					duration: 750,
					easing	: 'linear',
					queue	: false,
				}
			});
		} catch(err) {

		}
		return false;
	});


	var filterItemA	= $('.filter a');

	filterItemA.on('click', function(){
		var $this = $(this);
		if ( !$this.hasClass('active')) {
			filterItemA.removeClass('active');
			$this.addClass('active');
		}
	});
	
	// Timer
	$('#fun-fact').bind('inview', function(event, visible, visiblePartX, visiblePartY) {
		if (visible) {
			$(this).find('.timer').each(function () {
				var $this = $(this);
				$({ Counter: 0 }).animate({ Counter: $this.text() }, {
					duration: 2000,
					easing: 'swing',
					step: function () {
						$this.text(Math.ceil(this.Counter));
					}
				});
			});
			$(this).unbind('inview');
		}
	});

	//Initiat WOW JS
	new WOW().init();
	
	//smoothScroll
	smoothScroll.init();
	
	// Google Map Customization
	(function(){

		var map;

		map = new GMaps({
			el: '#gmap',
			lat: 25.0469578,
			lng: 55.2082221,
			scrollwheel:false,
			zoom: 14,
			zoomControl : true,
			panControl : false,
			streetViewControl : false,
			mapTypeControl: false,
			overviewMapControl: false,
			clickable: false
		});

		var image = '';
		map.addMarker({
			title: 'Click for complete Address',
			lat: 25.0492202,
			lng: 55.2161219,
			icon: image,
			animation: google.maps.Animation.DROP,
			verticalAlign: 'bottom',
			horizontalAlign: 'center',
			backgroundColor: '#d3cfcf',
			infoWindow: {
			  content: '<strong><p>Archen Offices <br/> Office A-105<br/>Prime Business Centre<br/>Jumeirah Village Circle<br/>Dubai</p></strong>'
			}
		});


		var styles = [ 

		{
			"featureType": "road",
			"stylers": [
			{ "color": "#005b96" }
			]
		},{
			"featureType": "water",
			"stylers": [
			{ "color": "#99b3cc" }
			]
		},{
			"featureType": "landscape",
			"stylers": [
			{ "color": "#ffffff" }
			]
		},{
			"elementType": "labels.text.fill",
			"stylers": [
			{ "color": "#d3cfcf" }
			]
		},{
			"featureType": "poi",
			"stylers": [
			{ "color": "#0a446a" }
			]
		},{
			"elementType": "labels.text",
			"stylers": [
			{ "saturation": 1 },
			{ "weight": 0.1 },
			{ "color": "#000000" }
			]
		}

		];

		map.addStyle({
			styledMapName:"Styled Map",
			styles: styles,
			mapTypeId: "map_style"  
		});

		map.setStyle("map_style");
	}());		
		
});

