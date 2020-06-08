window.theme = window.theme || {};

/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];
  $(document).on('shopify:section:load', this._onSectionLoad.bind(this)).on('shopify:section:unload', this._onSectionUnload.bind(this)).on('shopify:section:select', this._onSelect.bind(this)).on('shopify:section:deselect', this._onDeselect.bind(this)).on('shopify:block:select', this._onBlockSelect.bind(this)).on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (_.isUndefined(constructor)) {
      return;
    }

    var instance = _.assignIn(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    this.instances = _.filter(this.instances, function(instance) {
      var isEventInstance = (instance.id === evt.detail.sectionId);

      if (isEventInstance) {
        if (_.isFunction(instance.onUnload)) {
          instance.onUnload(evt);
        }
      }

      return !isEventInstance;
    });
  },

  _onSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
      instance.onDeselect(evt);
    }
  },

  _onBlockSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(function(index, container) {
      this._createInstance(container, constructor);
    }.bind(this));
  }
});

window.slate = window.slate || {};

/**
 * iFrames
 * -----------------------------------------------------------------------------
 * Wrap videos in div to force responsive layout.
 *
 * @namespace iframes
 */

slate.rte = {
  wrapTable: function() {
    $('.rte table').wrap('<div class="rte__table-wrapper"></div>');
  },

  iframeReset: function() {
    var $iframeVideo = $('.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]');
    var $iframeReset = $iframeVideo.add('.rte iframe#admin_bar_iframe');

    $iframeVideo.each(function() {
      // Add wrapper to make video responsive
      $(this).wrap('<div class="video-wrapper"></div>');
    });

    $iframeReset.each(function() {
      // Re-set the src attribute on each iframe after page load
      // for Chrome's "incorrect iFrame content on 'back'" bug.
      // https://code.google.com/p/chromium/issues/detail?id=395791
      // Need to specifically target video and admin bar
      this.src = this.src;
    });
  }
};

window.slate = window.slate || {};

/**
 * A11y Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help make your theme more accessible
 * to users with visual impairments.
 *
 *
 * @namespace a11y
 */

slate.a11y = {

  /**
   * For use when focus shifts to a container rather than a link
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects if focusing a link, just $link.focus();
   *
   * @param {JQuery} $element - The element to be acted upon
   */
  pageLinkFocus: function($element) {
    var focusClass = 'js-focus-hidden';

    $element.first().attr('tabIndex', '-1').focus().addClass(focusClass).one('blur', callback);

    function callback() {
      $element.first().removeClass(focusClass).removeAttr('tabindex');
    }
  },

  /**
   * If there's a hash in the url, focus the appropriate element
   */
  focusHash: function() {
    var hash = window.location.hash;

    // is there a hash in the url? is it an element on the page?
    if (hash && document.getElementById(hash.slice(1))) {
      this.pageLinkFocus($(hash));
    }
  },

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   */
  bindInPageLinks: function() {
    $('a[href*=#]').on('click', function(evt) {
      this.pageLinkFocus($(evt.currentTarget.hash));
    }.bind(this));
  },

  /**
   * Traps the focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  trapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (!options.$elementToFocus) {
      options.$elementToFocus = options.$container;
    }

    options.$container.attr('tabindex', '-1');
    options.$elementToFocus.focus();

    $(document).off('focusin');

    $(document).on(eventName, function(evt) {
      if (options.$container[0] !== evt.target && !options.$container.has(evt.target).length) {
        options.$container.focus();
      }
    });
  },

  /**
   * Removes the trap of focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  removeTrapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (options.$container && options.$container.length) {
      options.$container.removeAttr('tabindex');
    }

    $(document).off(eventName);
  }
};

/*** Image Helper Functions ** A collection of functions that help with basic image operations. **/
theme.Images = (function() {

  /** Preloads an image in memory and uses the browsers cache to store it until needed.
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /*** Loads and caches an image in the browsers cache.
   * @param {string} path - An image url */
  function loadImage(path) { new Image().src = path; }

  /*** Swaps the src of an image for another OR returns the imageURL to the callback function
   * @param image * @param element * @param callback */
  function switchImage(image, element, callback) {
    var size = this.imageSize(element.src);
    var imageUrl = this.getSizedImageUrl(image.src, size);

    if (callback) {
      callback(imageUrl, image, element); // eslint-disable-line callback-return
    } else {
      element.src = imageUrl;
    }
  }

  /** +++ Useful * Find the Shopify image attribute size
   ** @param {string} src * @returns {null} */
  function imageSize(src) {
    var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);

    if (match !== null) {
      return match[1];
    } else {
      return null;
    }
  }

  /** +++ Useful * Adds a Shopify size attribute to a URL
   * @param src * @param size * @returns {*} */
  function getSizedImageUrl(src, size) {
    if (size == null) { return src; }
    if (size === 'master') { return this.removeProtocol(src); }

    var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

    if (match != null) {
      var prefix = src.split(match[0]);
      var suffix = match[0];
      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    }
    return null;
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    switchImage: switchImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

/** Currency Helpers
 * Alternatives
 * - Accounting.js - http://openexchangerates.github.io/accounting.js/ **/
theme.Currency = (function() {
  var moneyFormat = '${{amount}}'; // eslint-disable-line camelcase

  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = precision || 2;
      thousands = thousands || ',';
      decimal = decimal || '.';

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  }
})();

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist.  Also updates the master select and triggers updates when the variants
 * price or image changes.
 * @namespace variants */
slate.Variants = (function() {

  /*** Variant constructor * @param {object} options - Settings from `product.js` */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();

    $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
  }

  Variants.prototype = _.assignIn({}, Variants.prototype, {

    /*** Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     * @return {array} options - Values of currently selected variants */
    _getCurrentOptions: function() {
      var currentOptions = _.map($(this.singleOptionSelector, this.$container), function(element) {
        var $element = $(element);
        var type = $element.attr('type');
        var currentOption = {};

        if (type === 'radio' || type === 'checkbox') {
          if ($element[0].checked) {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          } else {
            return false;
          }
        } else {
          currentOption.value = $element.val();
          currentOption.index = $element.data('index');
          var slvaraint = currentOption.value.replace(/'/g, "\\'");
          $("."+currentOption.index).find(".swatchInput[value='"+slvaraint+"']").prop("checked", true);
		  $("."+currentOption.index).find(".slVariant").text(currentOption.value);
          return currentOption;
        }
      });

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = _.compact(currentOptions);

      return currentOptions;
    },

    /*** Find variant based on selected values.
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants*/
    _getVariantFromOptions: function() {
      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;

      var found = _.find(variants, function(variant) {
        return selectedValues.every(function(values) {
          return _.isEqual(variant[values.index], values.value);
        });
      });

      return found;
    },

    /*** Event handler for when a variant input changes. */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();

      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });

      if (!variant){
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this._updateSKU(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    /**
     * Trigger event when variant image changes
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      var variantImage = variant.featured_image || {};
      var currentVariantImage = this.currentVariant.featured_image || {};

      if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
        return;
      }
      this.$container.trigger({
        type: 'variantImageChange', variant: variant
      });
    },

    /*** Trigger event when variant price changes. *  @param  {object} variant - Currently selected variant * @return {event} variantPriceChange */
    _updatePrice: function(variant) {
      if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
        return;
      }
      this.$container.trigger({
        type: 'variantPriceChange', variant: variant
      });
    },

    /*** Trigger event when variant sku changes. *  @param  {object} variant - Currently selected variant *  @return {event} variantSKUChange */
    _updateSKU: function(variant) {
      if (variant.sku === this.currentVariant.sku) {
        return;
      }
      this.$container.trigger({
        type: 'variantSKUChange', variant: variant
      });
    },

    /** Update history state for product deeplinking
     * @param  {variant} variant - Currently selected variant
     * @return {k}         [description] */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);
    },

    /*** Update hidden master select of variant change
     * @param  {variant} variant - Currently selected variant */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container).val(variant.id);
    }
  });

  return Variants;
})();

/* ================ MODULES ================ */
window.theme = window.theme || {};

theme.Header = (function() {
  var selectors = {
    body: 'body',
    sitenav: '#siteNav',
    navLinks: '#siteNav .lvl1 > a',
    mobilenav: '.mobile-nav-wrapper',
    menuLinks: '#MobileNav .ad'
  };

  function init() {
    
    $(".header-cart").on('click', function(i){
      i.preventDefault();i.stopPropagation();
      $("#cart-drawer").toggleClass("active");
    });
    $(".page-wrapper, .close-cart").on('click', function(){
      $("#cart-drawer").removeClass("active");
    });
    
    $(".site-settings").on('click', function(){
      $("#settingsBox").toggleClass("active");
    });

  	$(selectors.navLinks).each(function(){
        if($(this).attr('href') == window.location.pathname) $(this).addClass('active');
    })

  	$('.js-mobile-nav-toggle, .closemobileMenu').on("click",function(){
      body: 'body',
      $(selectors.mobilenav).toggleClass("active");
      $(selectors.body).toggleClass("menuOn");
      $('.js-mobile-nav-toggle').toggleClass('open close');
    });

    $("body").click(function(event){
      var $target = $(event.target);
      if(!$target.parents().is(selectors.mobilenav) && !$target.parents().is('.js-mobile-nav-toggle') && !$target.is('.js-mobile-nav-toggle')){
          $(selectors.mobilenav).removeClass("active");
          $(selectors.body).removeClass("menuOn");
          $('.js-mobile-nav-toggle').removeClass('close').addClass('open');
      }
      // Hide settingsBox on document click
      if(!$target.parents().is("#settingsBox") && !$target.parents().is(".site-settings") && !$target.is(".site-settings")){
        $("#settingsBox").removeClass("active");
      }
    });
  	
	$(selectors.menuLinks).on('click', function(e) {
		e.preventDefault();
		$(this).toggleClass('ad-plus-l ad-minus-l');
		$(this).parent().next().slideToggle();
    });
  }
  return { init: init };
})();

window.theme = window.theme || {};
theme.Search = (function() {
  var selectors = {
    search: '.search',
    searchSubmit: '.search__submit',
    searchInput: '.search__input'
  };

  var classes = { focus: 'search--focus' };

  function init() {
    searchSubmit();
    // Current Ajax Search request.
    var currentAjaxRequest = null;
    var searchForms = $('form[action="/search"]').css('position','relative').each(function() {
      var input = $(this).find('input[name="q"]');
      input.bind('keyup change', function(){
        var term = $(this).val(),
        	form = $(this).closest('form'),
        	resultsList = form.find('.search-results');
		if (term.length > 2 ) {
            $.getJSON("/search/suggest.json?q="+ term, {
              "resources": {
                "type": "product",
                "limit": 8,
                "options": {
                  "unavailable_products": "last",
                  "fields": "title,product_type,vendor,variants.title,variants.sku,tag"
                }
              }
            }).done(function(response) {
              var products = response.resources.results.products;
              resultsList.empty();
              if (products.length > 0) {
                $.each(products, function(index, item) {
                  var item = $('<li><a href="'+ item.url +'"><span class="img"><img src="' + item.featured_image.url + '" /></span><span class="details">' + item.title + '<span class="price">' + item.price + '</span></span></a></li>');
                  resultsList.append(item);
                });
                resultsList.fadeIn(200);
              } else {
                resultsList.hide();
              }
            });
    	} else { resultsList.empty().hide(); }
      });
    });
    $('.modalOverly, .closeSearch').bind('click', function(){
      $('body').removeClass("showOverly");
      $('#searchPopup').removeClass("active");
    });
    $('.site-header .searchIco').on('click', function(s){
      s.stopPropagation();
      $('body').addClass("showOverly");
      $('#searchPopup').addClass("active");
      $('input[name=q]').focus();
    });
  }

    function searchSubmit() {
      $(selectors.searchSubmit).on('click', function(evt) {
        var $el = $(evt.target);
        var $input = $el.parents(selectors.search).find(selectors.searchInput);
        if ($input.val().length === 0) {
          evt.preventDefault();
          searchFocus($input);
        }
      });
    }
    return { init:init };
})();

(function() {
  var selectors = { backButton: '.return-link' };
  var $backButton = $(selectors.backButton);

  if (!document.referrer || !$backButton.length || !window.history.length) {
    return;
  }

  $backButton.one('click', function(evt) {
    evt.preventDefault();
    var referrerDomain = urlDomain(document.referrer);
    var shopDomain = urlDomain(window.location.href);
    if (shopDomain === referrerDomain) { history.back(); }
    return false;
  });

  function urlDomain(url) {
    var anchor = document.createElement('a');
    anchor.ref = url;
    return anchor.hostname;
  }
})();

theme.Slideshow = (function() {
  this.$slideshow = null;
  var classes = {
    wrapper: 'slideshow-wrapper',
    slideshow: 'slideshow',
    currentSlide: 'slick-current',
    video: 'slideshow__video',
    videoBackground: 'slideshow__video--background',
    closeVideoBtn: 'slideshow__video-control--close',
    pauseButton: 'slideshow__pause',
    isPaused: 'is-paused'
  };

  function slideshow(el) {
    this.$slideshow = $(el);
    this.$wrapper = this.$slideshow.closest('.' + classes.wrapper);
    this.$pause = this.$wrapper.find('.' + classes.pauseButton);

    this.settings = {
      accessibility: true,
      arrows: this.$slideshow.data('arrow'),
      dots: this.$slideshow.data('dots'),
      fade: true,
      rtl:theme.rtl,
      draggable: true,
      touchThreshold: 20,
      autoplay: this.$slideshow.data('autoplay'),
      autoplaySpeed: this.$slideshow.data('speed')
    };

    this.$slideshow.on('beforeChange', beforeChange.bind(this));
    this.$slideshow.on('init', slideshowA11y.bind(this));
    this.$slideshow.slick(this.settings);

    this.$pause.on('click', this.togglePause.bind(this));
  }

  function slideshowA11y(event, obj) {
    var $slider = obj.$slider;
    var $list = obj.$list;
    var $wrapper = this.$wrapper;
    var autoplay = this.settings.autoplay;

    // Remove default Slick aria-live attr until slider is focused
    $list.removeAttr('aria-live');

    // When an element in the slider is focused
    // pause slideshow and set aria-live.
    $wrapper.on('focusin', function(evt) {
      if (!$wrapper.has(evt.target).length) {
        return;
      }

      $list.attr('aria-live', 'polite');

      if (autoplay) {
        $slider.slick('slickPause');
      }
    });

    // Resume autoplay
    $wrapper.on('focusout', function(evt) {
      if (!$wrapper.has(evt.target).length) {
        return;
      }

      $list.removeAttr('aria-live');

      if (autoplay) {
        // Manual check if the focused element was the video close button
        // to ensure autoplay does not resume when focus goes inside YouTube iframe
        if ($(evt.target).hasClass(classes.closeVideoBtn)) {
          return;
        }

        $slider.slick('slickPlay');
      }
    });

    // Add arrow key support when focused
    if (obj.$dots) {
      obj.$dots.on('keydown', function(evt) {
        if (evt.which === 37) {
          $slider.slick('slickPrev');
        }

        if (evt.which === 39) {
          $slider.slick('slickNext');
        }

        // Update focus on newly selected tab
        if ((evt.which === 37) || (evt.which === 39)) {
          obj.$dots.find('.slick-active button').focus();
        }
      });
    }
  }

  function beforeChange(event, slick, currentSlide, nextSlide) {
    var $slider = slick.$slider;
    var $currentSlide = $slider.find('.' + classes.currentSlide);
    var $nextSlide = $slider.find('.slideshow__slide[data-slick-index="' + nextSlide + '"]');

    if (isVideoInSlide($currentSlide)) {
      var $currentVideo = $currentSlide.find('.' + classes.video);
      var currentVideoId = $currentVideo.attr('id');
      theme.SlideshowVideo.pauseVideo(currentVideoId);
      $currentVideo.attr('tabindex', '-1');
    }

    if (isVideoInSlide($nextSlide)) {
      var $video = $nextSlide.find('.' + classes.video);
      var videoId = $video.attr('id');
      var isBackground = $video.hasClass(classes.videoBackground);
      if (isBackground) {
        theme.SlideshowVideo.playVideo(videoId);
      } else {
        $video.attr('tabindex', '0');
      }
    }
  }

  function isVideoInSlide($slide) {
    return $slide.find('.' + classes.video).length;
  }

  slideshow.prototype.togglePause = function() {
    var slideshowSelector = getSlideshowId(this.$pause);
    if (this.$pause.hasClass(classes.isPaused)) {
      this.$pause.removeClass(classes.isPaused);
      $(slideshowSelector).slick('slickPlay');
    } else {
      this.$pause.addClass(classes.isPaused);
      $(slideshowSelector).slick('slickPause');
    }
  };

  function getSlideshowId($el) {
    return '#Slideshow-' + $el.data('id');
  }

  return slideshow;
})();

// Youtube API callback
// eslint-disable-next-line no-unused-vars
function onYouTubeIframeAPIReady() {
  theme.SlideshowVideo.loadVideos();
}

theme.SlideshowVideo = (function() {
  var autoplayCheckComplete = false;
  var autoplayAvailable = false;
  var playOnClickChecked = false;
  var playOnClick = false;
  var youtubeLoaded = false;
  var videos = {};
  var videoPlayers = [];
  var videoOptions = {
    ratio: 16 / 9,
    playerVars: {
      // eslint-disable-next-line camelcase
      iv_load_policy: 3,
      modestbranding: 1,
      autoplay: 0,
      controls: 0,
      showinfo: 0,
      wmode: 'opaque',
      branding: 0,
      autohide: 0,
      rel: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerChange
    }
  };
  var classes = {
    playing: 'video-is-playing',
    paused: 'video-is-paused',
    loading: 'video-is-loading',
    loaded: 'video-is-loaded',
    slideshowWrapper: 'slideshow-wrapper',
    slide: 'slideshow__slide',
    slideBackgroundVideo: 'slideshow__slide--background-video',
    slideDots: 'slick-dots',
    videoChrome: 'slideshow__video--chrome',
    videoBackground: 'slideshow__video--background',
    playVideoBtn: 'slideshow__video-control--play',
    closeVideoBtn: 'slideshow__video-control--close',
    currentSlide: 'slick-current',
    slickClone: 'slick-cloned',
    supportsAutoplay: 'autoplay',
    supportsNoAutoplay: 'no-autoplay'
  };

  /*** Public functions **/
  function init($video) {
    if (!$video.length) {
      return;
    }

    videos[$video.attr('id')] = {
      id: $video.attr('id'),
      videoId: $video.data('id'),
      type: $video.data('type'),
      status: $video.data('type') === 'chrome' ? 'closed' : 'background', // closed, open, background
      videoSelector: $video.attr('id'),
      $parentSlide: $video.closest('.' + classes.slide),
      $parentSlideshowWrapper: $video.closest('.' + classes.slideshowWrapper),
      controls: $video.data('type') === 'background' ? 0 : 1,
      slideshow: $video.data('slideshow')
    };

    if (!youtubeLoaded) {
      // This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  function customPlayVideo(playerId) {
    // Do not autoplay just because the slideshow asked you to.
    // If the slideshow asks to play a video, make sure
    // we have done the playOnClick check first
    if (!playOnClickChecked && !playOnClick) {
      return;
    }

    if (playerId && typeof videoPlayers[playerId].playVideo === 'function') {
      privatePlayVideo(playerId);
    }
  }

  function pauseVideo(playerId) {
    if (videoPlayers[playerId] && typeof videoPlayers[playerId].pauseVideo === 'function') {
      videoPlayers[playerId].pauseVideo();
    }
  }

  function loadVideos() {
    for (var key in videos) {
      if (videos.hasOwnProperty(key)) {
        var args = $.extend({}, videoOptions, videos[key]);
        args.playerVars.controls = args.controls;
        videoPlayers[key] = new YT.Player(key, args);
      }
    }

    initEvents();
    youtubeLoaded = true;
  }

  function loadVideo(key) {
    if (!youtubeLoaded) {
      return;
    }
    var args = $.extend({}, videoOptions, videos[key]);
    args.playerVars.controls = args.controls;
    videoPlayers[key] = new YT.Player(key, args);

    initEvents();
  }

  /*** Private functions */
  function privatePlayVideo(id, clicked) {
    var videoData = videos[id];
    var player = videoPlayers[id];
    var $slide = videos[id].$parentSlide;

    if (playOnClick) {
      // playOnClick means we are probably on mobile (no autoplay).
      // setAsPlaying will show the iframe, requiring another click
      // to play the video.
      setAsPlaying(videoData);
    } else if (clicked || (autoplayCheckComplete && autoplayAvailable)) {
      // Play if autoplay is available or clicked to play
      $slide.removeClass(classes.loading);
      setAsPlaying(videoData);
      player.playVideo();
      return;
    }

    // Check for autoplay if not already done
    if (!autoplayCheckComplete) {
      autoplayCheckFunction(player, $slide);
    }
  }

  function setAutoplaySupport(supported) {
    var supportClass = supported ? classes.supportsAutoplay : classes.supportsNoAutoplay;
    $(document.documentElement).addClass(supportClass);

    if (!supported) {
      playOnClick = true;
    }

    autoplayCheckComplete = true;
  }

  function autoplayCheckFunction(player, $slide) {
    // attempt to play video
    player.playVideo();

    autoplayTest(player)
      .then(function() {
        setAutoplaySupport(true);
      })
      .fail(function() {
        // No autoplay available (or took too long to start playing).
        // Show fallback image. Stop video for safety.
        setAutoplaySupport(false);
        player.stopVideo();
      })
      .always(function() {
        autoplayCheckComplete = true;
        $slide.removeClass(classes.loading);
      });
  }

  function autoplayTest(player) {
    var deferred = $.Deferred();
    var wait;
    var timeout;

    wait = setInterval(function() {
      if (player.getCurrentTime() <= 0) {
        return;
      }

      autoplayAvailable = true;
      clearInterval(wait);
      clearTimeout(timeout);
      deferred.resolve();
    }, 500);

    timeout = setTimeout(function() {
      clearInterval(wait);
      deferred.reject();
    }, 4000); // subjective. test up to 8 times over 4 seconds

    return deferred;
  }

  function playOnClickCheck() {
    // Bail early for a few instances:
    // - small screen
    // - device sniff mobile browser

    if (playOnClickChecked) { return; }

    if ($(window).width() < 750) {
      playOnClick = true;
    } else if (window.mobileCheck()) {
      playOnClick = true;
    }

    if (playOnClick) { setAutoplaySupport(false); }
    playOnClickChecked = true;
  }

  // The API will call this function when each video player is ready
  function onPlayerReady(evt) {
    evt.target.setPlaybackQuality('hd1080');
    var videoData = getVideoOptions(evt);

    playOnClickCheck();

    // Prevent tabbing through YouTube player controls until visible
    $('#' + videoData.id).attr('tabindex', '-1');

    sizeBackgroundVideos();

    // Customize based on options from the video ID
    switch (videoData.type) {
      case 'background-chrome':
      case 'background':
        evt.target.mute();
        // Only play the video if it is in the active slide
        if (videoData.$parentSlide.hasClass(classes.currentSlide)) {
          privatePlayVideo(videoData.id);
        }
        break;
    }

    videoData.$parentSlide.addClass(classes.loaded);
  }

  function onPlayerChange(evt) {
    var videoData = getVideoOptions(evt);

    switch (evt.data) {
      case 0: // ended
        setAsFinished(videoData);
        break;
      case 1: // playing
        setAsPlaying(videoData);
        break;
      case 2: // paused
        setAsPaused(videoData);
        break;
    }
  }

  function setAsFinished(videoData) {
    switch (videoData.type) {
      case 'background':
        videoPlayers[videoData.id].seekTo(0);
        break;
      case 'background-chrome':
        videoPlayers[videoData.id].seekTo(0);
        closeVideo(videoData.id);
        break;
      case 'chrome':
        closeVideo(videoData.id);
        break;
    }
  }

  function setAsPlaying(videoData) {
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;

    $slide.removeClass(classes.loading);

    // Do not change element visibility if it is a background video
    if (videoData.status === 'background') {
      return;
    }

    $('#' + videoData.id).attr('tabindex', '0');

    switch (videoData.type) {
      case 'chrome':
      case 'background-chrome':
        $slideshow
          .removeClass(classes.paused)
          .addClass(classes.playing);
        $slide
          .removeClass(classes.paused)
          .addClass(classes.playing);
        break;
    }

    // Update focus to the close button so we stay within the slide
    $slide.find('.' + classes.closeVideoBtn).focus();
  }

  function setAsPaused(videoData) {
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;

    if (videoData.type === 'background-chrome') {
      closeVideo(videoData.id);
      return;
    }

    // YT's events fire after our click event. This status flag ensures
    // we don't interact with a closed or background video.
    if (videoData.status !== 'closed' && videoData.type !== 'background') {
      $slideshow.addClass(classes.paused);
      $slide.addClass(classes.paused);
    }

    if (videoData.type === 'chrome' && videoData.status === 'closed') {
      $slideshow.removeClass(classes.paused);
      $slide.removeClass(classes.paused);
    }

    $slideshow.removeClass(classes.playing);
    $slide.removeClass(classes.playing);
  }

  function closeVideo(playerId) {
    var videoData = videos[playerId];
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;
    var classesToRemove = [classes.pause, classes.playing].join(' ');

    $('#' + videoData.id).attr('tabindex', '-1');

    videoData.status = 'closed';

    switch (videoData.type) {
      case 'background-chrome':
        videoPlayers[playerId].mute();
        setBackgroundVideo(playerId);
        break;
      case 'chrome':
        videoPlayers[playerId].stopVideo();
        setAsPaused(videoData); // in case the video is already paused
        break;
    }

    $slideshow.removeClass(classesToRemove);
    $slide.removeClass(classesToRemove);
  }

  function getVideoOptions(evt) {
    return videos[evt.target.a.id];
  }

  function startVideoOnClick(playerId) {
    var videoData = videos[playerId];
    // add loading class to slide
    videoData.$parentSlide.addClass(classes.loading);

    videoData.status = 'open';

    switch (videoData.type) {
      case 'background-chrome':
        unsetBackgroundVideo(playerId, videoData);
        videoPlayers[playerId].unMute();
        privatePlayVideo(playerId, true);
        break;
      case 'chrome':
        privatePlayVideo(playerId, true);
        break;
    }

    // esc to close video player
    $(document).on('keydown.videoPlayer', function(evt) {
      if (evt.keyCode === 27) {
        closeVideo(playerId);
      }
    });
  }

  function sizeBackgroundVideos() {
    $('.' + classes.videoBackground).each(function(index, el) {
      sizeBackgroundVideo($(el));
    });
  }

  function sizeBackgroundVideo($player) {
    var $slide = $player.closest('.' + classes.slide);
    // Ignore cloned slides
    if ($slide.hasClass(classes.slickClone)) {
      return;
    }
    var slideWidth = $slide.width();
    var playerWidth = $player.width();
    var playerHeight = $player.height();

    // when screen aspect ratio differs from video, video must center and underlay one dimension
    if (slideWidth / videoOptions.ratio < playerHeight) {
      playerWidth = Math.ceil(playerHeight * videoOptions.ratio); // get new player width
      $player.width(playerWidth).height(playerHeight).css({
        left: (slideWidth - playerWidth) / 2,
        top: 0
      }); // player width is greater, offset left; reset top
    } else { // new video width < window width (gap to right)
      playerHeight = Math.ceil(slideWidth / videoOptions.ratio); // get new player height
      $player.width(slideWidth).height(playerHeight).css({
        left: 0,
        top: (playerHeight - playerHeight) / 2
      }); // player height is greater, offset top; reset left
    }

    $player
      .prepareTransition()
      .addClass(classes.loaded);
  }

  function unsetBackgroundVideo(playerId) {
    // Switch the background-chrome to a chrome-only player once played
    $('#' + playerId)
      .removeAttr('style')
      .removeClass(classes.videoBackground)
      .addClass(classes.videoChrome);

    videos[playerId].$parentSlideshowWrapper
      .removeClass(classes.slideBackgroundVideo)
      .addClass(classes.playing);

    videos[playerId].$parentSlide
      .removeClass(classes.slideBackgroundVideo)
      .addClass(classes.playing);

    videos[playerId].status = 'open';
  }

  function setBackgroundVideo(playerId) {
    // Switch back to background-chrome when closed
    var $player = $('#' + playerId)
      .addClass(classes.videoBackground)
      .removeClass(classes.videoChrome);

    videos[playerId].$parentSlide
      .addClass(classes.slideBackgroundVideo);

    videos[playerId].status = 'background';
    sizeBackgroundVideo($player);
  }

  function initEvents() {
    $(document).on('click.videoPlayer', '.' + classes.playVideoBtn, function(evt) {
      var playerId = $(evt.currentTarget).data('controls');
      startVideoOnClick(playerId);
    });

    $(document).on('click.videoPlayer', '.' + classes.closeVideoBtn, function(evt) {
      var playerId = $(evt.currentTarget).data('controls');
      closeVideo(playerId);
    });

    // Listen to resize to keep a background-size:cover-like layout
    $(window).on('resize.videoPlayer', $.debounce(250, function() {
      if (youtubeLoaded) {
        sizeBackgroundVideos();
      }
    }));
  }

  function removeEvents() {
    $(document).off('.videoPlayer');
    $(window).off('.videoPlayer');
  }

  return {
    init: init,
    loadVideos: loadVideos,
    loadVideo: loadVideo,
    playVideo: customPlayVideo,
    pauseVideo: pauseVideo,
    removeEvents: removeEvents
  };
})();


/* ================ TEMPLATES ================ */
window.theme = theme || {};

theme.customerTemplates = (function() {

  function initEventListeners() {
    // Show reset password form
    $('#RecoverPassword').on('click', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });

    // Hide reset password form
    $('#HideRecoverPasswordLink').on('click', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });
  }

  /****  Show/Hide recover password form **/
  function toggleRecoverPasswordForm() {
    $('#RecoverPasswordForm').toggleClass('hide');
    $('#CustomerLoginForm').toggleClass('hide');
  }

  /****  Show reset password success message **/
  function resetPasswordSuccess() {
    var $formState = $('.reset-password-success');

    // check if reset password form was successfully submited.
    if (!$formState.length) {
      return;
    }

    // show success message
    $('#ResetSuccess').removeClass('hide');
  }

  /****  Show/hide customer address forms **/
  function customerAddressForm() {
    var $newAddressForm = $('#AddressNewForm');

    if (!$newAddressForm.length) {
      return;
    }

    // Initialize observers on address selectors, defined in shopify_common.js
    if (Shopify) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew'
      });
    }

    // Initialize each edit form's country/province selector
    $('.address-country-option').each(function() {
      var formId = $(this).data('form-id');
      var countrySelector = 'AddressCountry_' + formId;
      var provinceSelector = 'AddressProvince_' + formId;
      var containerSelector = 'AddressProvinceContainer_' + formId;

      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector
      });
    });

    // Toggle new/edit address forms
    $('.address-new-toggle').on('click', function() {
      $newAddressForm.toggleClass('hide');
    });

    $('.address-edit-toggle').on('click', function() {
      var formId = $(this).data('form-id');
      $('#EditAddress_' + formId).toggleClass('hide');
    });

    $('.address-delete').on('click', function() {
      var $el = $(this);
      var formId = $el.data('form-id');
      var confirmMessage = $el.data('confirm-message');

      // eslint-disable-next-line no-alert
      if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
        Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
      }
    });
  }

  /****  Check URL for reset password hash **/
  function checkUrlHash() {
    var hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      toggleRecoverPasswordForm();
    }
  }

  return {
    init: function() {
      checkUrlHash();
      initEventListeners();
      resetPasswordSuccess();
      customerAddressForm();
    }
  };
})();

/*================ SECTIONS ================*/
window.theme = window.theme || {};

theme.Filters = (function() {
  var constants = {
    SORT_BY: 'sort_by'
  };
  var selectors = {
    filterSelection: '.filters-toolbar__input--filter',
    sortSelection: '.filters-toolbar__input--sort',
    defaultSort: '.collection-header__default-sort'
  };

  function Filters(container) {
    var $container = this.$container = $(container);

    this.$filterSelect = $(selectors.filterSelection, $container);
    this.$sortSelect = $(selectors.sortSelection, $container);
    this.$selects = $(selectors.filterSelection, $container).add($(selectors.sortSelection, $container));

    this.defaultSort = this._getDefaultSortValue();
    this._resizeSelect(this.$selects);
    this.$selects.removeClass('hidden');

    this.$filterSelect.on('change', this._onFilterChange.bind(this));
    this.$sortSelect.on('change', this._onSortChange.bind(this));
  }

  Filters.prototype = _.assignIn({}, Filters.prototype, {
    _onSortChange: function(evt) {
      var sort = this._sortValue();
      if (sort.length) {
        window.location.search = sort;
      } else {
        // clean up our url if the sort value is blank for default
        window.location.href = window.location.href.replace(window.location.search, '');
      }
      this._resizeSelect($(evt.target));
    },

    _onFilterChange: function(evt) {
      window.location.href = this.$filterSelect.val() + window.location.search;
      this._resizeSelect($(evt.target));
    },

    _getSortValue: function() {
      return this.$sortSelect.val() || this.defaultSort;
    },

    _getDefaultSortValue: function() {
      return $(selectors.defaultSort, this.$container).val();
    },

    _sortValue: function() {
      var sort = this._getSortValue();
      var query = '';

      if (sort !== this.defaultSort) {
        query = constants.SORT_BY + '=' + sort;
      }

      return query;
    },

    _resizeSelect: function($selection) {
      $selection.each(function() {
        var $this = $(this);
        var arrowWidth = 10;
        // create test element
        var text = $this.find('option:selected').text();
        var $test = $('<span>').html(text);

        // add to body, get width, and get out
        $test.appendTo('body');
        var width = $test.width();
        $test.remove();

        // set select width
        $this.width(width + arrowWidth);
      });
    },

    onUnload: function() {
      this.$filterSelect.off('change', this._onFilterChange);
      this.$sortSelect.off('change', this._onSortChange);
    }
  });

  return Filters;
})();

window.theme = window.theme || {};

theme.HeaderSection = (function() {

  function Header() {
    theme.Header.init();
    theme.Search.init();
  }
  Header.prototype = _.assignIn({}, Header.prototype, {
    onUnload: function() {
      theme.Header.unload();
    }
  });

  return Header;
})();

theme.Maps = (function() {
  var config = {
    zoom: 14
  };
  var apiStatus = null;
  var mapsToLoad = [];
  var key = theme.mapKey ? theme.mapKey : '';

  function Map(container) {
    this.$container = $(container);

    if (apiStatus === 'loaded') {
      this.createMap();
    } else {
      mapsToLoad.push(this);

      if (apiStatus !== 'loading') {
        apiStatus = 'loading';
        if (typeof window.google === 'undefined') {
          $.getScript('https://maps.googleapis.com/maps/api/js?key=' + key)
            .then(function() {
              apiStatus = 'loaded';
              initAllMaps();
            });
        }
      }
    }
  }

  function initAllMaps() {
    // API has loaded, load all Map instances in queue
    $.each(mapsToLoad, function(index, instance) {
      instance.createMap();
    });
  }

  function geolocate($map) {
    var deferred = $.Deferred();
    var geocoder = new google.maps.Geocoder();
    var address = $map.data('address-setting');

    geocoder.geocode({address: address}, function(results, status) {
      if (status !== google.maps.GeocoderStatus.OK) {
        deferred.reject(status);
      }

      deferred.resolve(results);
    });

    return deferred;
  }

  Map.prototype = _.assignIn({}, Map.prototype, {
    createMap: function() {
      var $map = this.$container.find('.map-section__container');

      return geolocate($map)
        .then(function(results) {
          var mapOptions = {
            zoom: config.zoom,
            center: results[0].geometry.location,
            disableDefaultUI: true
          };

          var map = this.map = new google.maps.Map($map[0], mapOptions);
          var center = this.center = map.getCenter();

          //eslint-disable-next-line no-unused-vars
          var marker = new google.maps.Marker({
            map: map,
            position: map.getCenter()
          });

          google.maps.event.addDomListener(window, 'resize');
        }.bind(this))
        .fail(function() {
          var errorMessage;

          switch (status) {
            case 'ZERO_RESULTS':
              errorMessage = theme.strings.addressNoResults;
              break;
            case 'OVER_QUERY_LIMIT':
              errorMessage = theme.strings.addressQueryLimit;
              break;
            default:
              errorMessage = theme.strings.addressError;
              break;
          }
          $map.parent().addClass('page-width map-section--load-error').html('<div class="errors text-center">' + errorMessage + '</div>');
        });
    },
    onUnload: function() { google.maps.event.clearListeners(this.map, 'resize'); }
  });
  return Map;
})();

// Global function called by Google on auth errors.
// Show an auto error message on all map instances.
// eslint-disable-next-line camelcase, no-unused-vars
function gm_authFailure() {
  $('.map-section').addClass('map-section--load-error');
  $('.map-section__container').remove();
  $('.map-section__link').remove();
  $('.map-section__overlay').after('<div class="errors text-center">' + theme.strings.authError + '</div>');
}

/* eslint-disable no-new */
theme.Product = (function() {
  function Product(container) {
    var $container = this.$container = $(container),
    	sectionId = $container.attr('data-section-id');

    this.settings = {
      mediaQueryMediumUp: 'screen and (min-width: 768px)',
      mediaQuerySmall: 'screen and (max-width: 767px)',
      bpSmall: false,
      enableHistoryState: $container.data('enable-history-state') || false,
      imageSize: null,
      imageZoomSize: null,
      namespace: '.slideshow-' + sectionId,
      sectionId: sectionId,
      sliderActive: false,
      zoomEnabled: false
    };

    this.selectors = {
      addToCart: '#AddToCart-' + sectionId,
      addToCartText: '#AddToCartText-' + sectionId,
      comparePrice: '#ComparePrice-' + sectionId,
      originalPrice: '#ProductPrice-' + sectionId,
      saveAmount: '#SaveAmount-' + sectionId, 
      discountBadge: '.discount-badge',
      SKU: '.variant-sku',
      originalPriceWrapper: '.product-price__price-' + sectionId,
      originalSelectorId: '#ProductSelect-' + sectionId,
      productFeaturedImage: '.FeaturedImage-' + sectionId,
      productImageWrap: '.FeaturedImageZoom-' + sectionId,
      productPrices: '.product-single__price-' + sectionId,
      productThumbImages: '.product-single__thumbnail--' + sectionId,
      productThumbs: '.product-single__thumbnails-' + sectionId,
      saleClasses: 'product-price__sale product-price__sale--single',
      saleLabel: '.product-price__sale-label-' + sectionId,
      singleOptionSelector: '.single-option-selector-' + sectionId
    }
    
    // Orders Message
    var orderLimit = $(".orderMsg").attr('data-user'),
        orderTime = $(".orderMsg").attr('data-time');
    $(".orderMsg .items").text(Math.floor((Math.random() * orderLimit) + 1));
    $(".orderMsg .time").text(Math.floor((Math.random() * orderTime) + 1));
    
    // Visotore Message
    var userLimit = $(".userViewMsg").attr('data-user'),
        userTime = $(".userViewMsg").attr('data-time');
    $(".uersView").text(Math.floor((Math.random() * userLimit)));
    setInterval(function(){
    	$(".uersView").text(Math.floor((Math.random() * userLimit)));
	}, userTime);
    
    // Magnific Popup
    $('.mfp-link').magnificPopup({
      delegate: '.mfp',
  	  removalDelay: 300, 
      callbacks: {
        beforeOpen: function() {
          $('.stickyHeader').addClass('popup');
           this.st.mainClass = this.st.el.attr('data-effect');
        },       
      	close:function(){ $('.stickyHeader').removeClass('popup'); }
      },
  	 midClick: true 
	}); 
    
    // Product tabs
    var tabs = this.tabs = '#ProductSection-' + sectionId + ' .tablink';
    
    $(tabs).on('click', function(e){
      e.preventDefault();
        $(this).parent().addClass("active");
        $(this).parent().siblings().removeClass("active");
        var tab = $(this).attr("href");
        $(".tab-content").not(tab).css("display", "none");
        $(tab).fadeIn();
      	if($(window).width()<767) {
          var tabposition = $(this).offset();
          $("html, body").animate({ scrollTop: tabposition.top }, 500);
        }
    });

    $('.product-tabs li:first-child').addClass("active");
    $('.tab-container h3:first-child').addClass("active");
	$('.tab-container h3:first-child + .tab-content').show();
    
    $(".reviewLink").on('click', function(e){
      e.preventDefault();
      	var tab = $(this).attr("href");
        $(".product-tabs li").removeClass("active");
      	$(".tablink[href='"+tab+"']").parent().addClass("active");
        $(".tab-content").not(tab).css("display", "none");
        $(tab).fadeIn();
      	var tabposition = $(tab).offset();
      	if($(window).width()<767) {
          $("html, body").animate({ scrollTop: tabposition.top-50 }, 700);
        } else{
          $("html, body").animate({ scrollTop: tabposition.top-100 }, 700);
        }
    });
    
    $(".stickyOptions .selectedOpt").on('click', function(){
		$(".stickyOptions ul").slideToggle("fast");
    });
    $(".stickyOptions .vrOpt").on('click', function(e){
		var value = $(this).attr('data-val'),
            number = $(this).attr('data-no'),
            text = $(this).text();
      	$(".selectedOpt").text(text);
      	$(".stickyCart .selectbox").val(value).trigger('change');
      	$(".stickyOptions ul").slideUp("fast");
      	this.productvariants = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);
      	$(".stickyCart .product-featured-img").attr('src', this.productvariants.variants[number].featured_image.src.replace(/(\.[^\.]*$|$)/, '_60x60' + '$&'));
    });

    // change variant on image sections
    thumbnails = $('.product-single__thumbnail-image');
    if (thumbnails.length) {
      thumbnails.bind('click', function() {
        var arrImage = $(this).attr('src').split('?')[0].split('.');
        var strExtention = arrImage.pop();
        var strRemaining = arrImage.pop().replace(/_[a-zA-Z0-9@]+$/,'');
        var strNewImage = arrImage.join('.')+"."+strRemaining+"."+strExtention;
        if (typeof variantImages[strNewImage] !== 'undefined') {
            productOptions.forEach(function (value, i) {
             optionValue = variantImages[strNewImage]['option-'+i];
             if (optionValue !== null && $('.single-option-selector:eq('+i+') option').filter(function() { return $(this).text() === optionValue }).length) {
               $(".swatch-"+i).find('.swatchInput[value="'+optionValue+'"]').prop( "checked", true );
               $('.single-option-selector:eq('+i+')').val(optionValue).trigger('change');
             }
          });
        }
      });
    }
    
    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$('#ProductJson-' + sectionId).html()) {
      return;
    }

    this.productSingleObject = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);

    this.settings.zoomEnabled = $(this.selectors.productFeaturedImage).hasClass('js-zoom-enabled');
    this.settings.imageSize = theme.Images.imageSize($(this.selectors.productFeaturedImage).attr('src'));

    this._initBreakpoints();
    this._stringOverrides();
    this._initVariants();
    this._initImageSwitch();
   	this._initmainimageSlider();
   	this._initThumbnailSlider();
    this._setActiveThumbnail();
    
    // Pre-loading product images to avoid a lag when a thumbnail is clicked, or
    // when a variant is selected that has a variant image
    theme.Images.preload(this.productSingleObject.images, this.settings.imageSize);
  }

  Product.prototype = _.assignIn({}, Product.prototype, {
    _stringOverrides: function() {
      theme.productStrings = theme.productStrings || {};
      $.extend(theme.strings, theme.productStrings);
    },

    _initBreakpoints: function() {
      var self = this;

      enquire.register(this.settings.mediaQuerySmall, {
        match: function() {
          // destroy image zooming if enabled
          if (self.settings.zoomEnabled) {
            _destroyZoom($(self.selectors.productImageWrap));
          }
          self.settings.bpSmall = true;
        },
        unmatch: function() {
          self.settings.bpSmall = false;
        }
      });

      enquire.register(this.settings.mediaQueryMediumUp, {
        match: function() {
          if (self.settings.zoomEnabled) {
            _enableZoom($(self.selectors.productImageWrap));
          }
        }
      });
    },

    _initVariants: function() {
      var options = {
        $container: this.$container,
        enableHistoryState: this.$container.data('enable-history-state') || false,
        singleOptionSelector: this.selectors.singleOptionSelector,
        originalSelectorId: this.selectors.originalSelectorId,
        product: this.productSingleObject
      };

      this.variants = new slate.Variants(options);

      this.$container.on('variantChange' + this.settings.namespace, this._updateAddToCart.bind(this));
      this.$container.on('variantImageChange' + this.settings.namespace, this._updateImages.bind(this));
      this.$container.on('variantPriceChange' + this.settings.namespace, this._updatePrice.bind(this));
      this.$container.on('variantSKUChange' + this.settings.namespace, this._updateSKU.bind(this));
    },

    _initImageSwitch: function() {
      if (!$(this.selectors.productThumbImages).length) {
        return;
      }
      var self = this;
      $(this.selectors.productThumbImages).on('click', function(evt) {
        evt.preventDefault();
        var $el = $(this),
        	imageSrc = $el.attr('href'),
        	zoomSrc = $el.data('zoom');
        self._setActiveThumbnail(imageSrc);
        self._switchImage(imageSrc, zoomSrc);
      });
    },
    
    _switchImage: function(image, zoomImage) {
      if($(".index-section--featured-product").length){
        var $image = $(this.selectors.productImageWrap + '[data-zoom="' + zoomImage + '"]').data('slide');
        $(this.selectors.productFeaturedImage).attr('src', image);

        // destroy image zooming if enabled
        if (this.settings.zoomEnabled) {
          _destroyZoom($(this.selectors.productImageWrap));
        }

        if (!this.settings.bpSmall && this.settings.zoomEnabled && zoomImage) {
          $(this.selectors.productImageWrap).data('zoom', zoomImage);
          _enableZoom($(this.selectors.productImageWrap));
        }
      }
    },

    _setActiveThumbnail: function(src) {
      var activeClass = 'active-thumb';

      // If there is no element passed, find it by the current product image
      if (typeof src === 'undefined') {
        src = $(this.selectors.productThumbImages + '.activeSlide').attr('href');
      }

      // Set active thumbnails (incl. slick cloned thumbs) with matching 'href'
      var $thumbnail = $(this.selectors.productThumbImages + '[href="' + src + '"]');
      $(this.selectors.productThumbImages).removeClass(activeClass);
      $thumbnail.addClass(activeClass);
      var slideno = $thumbnail.parent().data('slide');
      $('.primgSlider').slick('slickGoTo', slideno);
    },

    _initmainimageSlider: function() {
       var slidetoshow = 1,
      	  fade = true,
          centermode = false,
      	  loop = false;
       if(theme.productStrings.prStyle == "style2"){
       	 slidetoshow = 2;
       	 fade = false;
       } else if (theme.productStrings.prStyle == "style7"){
         slidetoshow = 3;
         centermode = true;
         loop = true;
       	 fade = false;
       }
       $(".primgSlider").slick({
         slidesToShow: slidetoshow,
         slidesToScroll: 1,
         infinite: loop,
         rtl: theme.rtl,
         fade: fade,
         centerMode: centermode,
         centerPadding: 0,
         asNavFor: this.selectors.productThumbs,
         responsive: [{
              breakpoint: 767,
              settings: {
                slidesToShow: 1
              }
          }]
       });
       if (theme.productStrings.prStyle == "style4" || theme.productStrings.prStyle == "style5"){
         $(window).on('load resize', function(){
           if($(window).width() > 767){
           	$(".primgSlider").slick('unslick');
           } else {
             $(".primgSlider").slick("refresh");
           }
         });
       }
    },

    _initThumbnailSlider: function() {
      var sliderpos = $(this.selectors.productThumbs).attr('data-slider'),
          verticle = true,
          thumbcount = 5;
      if(sliderpos == 'bottom') {
        verticle = false;
        thumbcount = 6;
      }

      $(this.selectors.productThumbs).slick({
          verticalSwiping: true,
          vertical: verticle,
          slidesToShow: thumbcount,
          slidesToScroll: 1,
          infinite: false,
          rtl: theme.rtl,
          asNavFor: '.primgSlider',
          focusOnSelect: true,
          responsive: [
            {
              breakpoint: 767,
              settings: {
                slidesToShow: 5,
                vertical: false,
                swipe: true,
                verticalSwiping: false,
                draggable: false
              }
            }
          ]
      });
    },

    _updateAddToCart: function(evt) {
      var variant = evt.variant;

      if (variant){
        $(this.selectors.productPrices).removeClass('visibility-hidden').attr('aria-hidden', 'true');

        if (variant.available) {
          $(this.selectors.addToCart).prop('disabled', false);
          $(this.selectors.addToCartText).text(theme.strings.addToCart);
          $(".instock").removeClass("hide");
          $(".outstock").addClass("hide");
          var quantity = $("#pvr-"+variant.id).text(),
          	  maxquantity = $("#quantity_message").data('qty');
          if(quantity < maxquantity && quantity != 0){
          	$("#quantity_message").show().find(".items").text(quantity);
          } else {
            $("#quantity_message").hide();
          }
        } else {
          // The variant doesn't exist, disable submit button and change the text.
          // This may be an error or notice that a specific variant is not available.
          $(this.selectors.addToCart).prop('disabled', true);
          $(this.selectors.addToCartText).text(theme.strings.soldOut);
          $(".instock").addClass("hide");
          $(".outstock").removeClass("hide");
          $("#quantity_message").hide();
        }
      } else {
        $(this.selectors.addToCart).prop('disabled', true);
        $(this.selectors.addToCartText).text(theme.strings.unavailable);
        $(this.selectors.productPrices).addClass('visibility-hidden').attr('aria-hidden', 'false');
        $(".instock").addClass("hide");
        $(".outstock").removeClass("hide");
        $("#quantity_message").hide();
      }
    },

    _updateImages: function(evt) {
      var variant = evt.variant,
      	  sizedImgUrl = theme.Images.getSizedImageUrl(variant.featured_media.preview_image.src, this.settings.imageSize),
      	  zoomSizedImgUrl;
      this._setActiveThumbnail(sizedImgUrl);
      if (this.settings.zoomEnabled) {
        zoomSizedImgUrl = theme.Images.getSizedImageUrl(variant.featured_media.preview_image.src, this.settings.imageZoomSize);
      }
      this._switchImage(sizedImgUrl, zoomSizedImgUrl);
    },

    _updatePrice: function(evt) {
      var variant = evt.variant;

      // Update the product price
      $(this.selectors.originalPrice).html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));

      // Update and show the product's compare price if necessary
      if (variant.compare_at_price > variant.price) {
        $(this.selectors.comparePrice).html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat)).removeClass('hide');
        $(this.selectors.originalPriceWrapper).addClass(this.selectors.saleClasses);
        $(this.selectors.saleLabel).removeClass('hide');        
        var price1 = variant.compare_at_price-variant.price,
        	price2 = price1 * 100
        	salecount = price2/variant.compare_at_price;        
        $(this.selectors.discountBadge).find('.off').find('span').text(+salecount.toFixed());        
        $(this.selectors.discountBadge).removeClass('hide');
        $(this.selectors.saveAmount).html(theme.Currency.formatMoney(price1,  theme.moneyFormat));        

      } else {
        $(this.selectors.comparePrice).addClass('hide');
        $(this.selectors.saleLabel).addClass('hide');
        $(this.selectors.discountBadge).addClass('hide');
        $(this.selectors.originalPriceWrapper).removeClass(this.selectors.saleClasses);
      }
    },

    _updateSKU: function(evt) {
      var variant = evt.variant;
      $(this.selectors.SKU).html(variant.sku);
    },

    onUnload: function() {
      this.$container.off(this.settings.namespace);
    }
  });

  function _enableZoom($el) {
    $($el).each(function(){
    	var zoomUrl = $(this).data('zoom');
    	$(this).zoom({
      		url: zoomUrl
    	});
     });
  }

  function _destroyZoom($el) {
    $($el).each(function(){
    	$(this).trigger('zoom.destroy');
     });
  }
  return Product;
})();

// Product quick view
theme.QuickView = (function() {
  $('body').on( 'click', '.quick-view', function(e){
    $.ajax({
      beforeSend : function (){
        $('body').addClass("loading");
       },
      url: $(this).attr('href'),
      success: function(data) {

        $.magnificPopup.open({
          items: {
            src: '<div class="quick-view-popup mfp-with-anim" id="content_quickview">' + data + '</div>',
            type: 'inline'
          },
          removalDelay:500,
          callbacks: {
            beforeOpen: function(){
             $('.stickyHeader').addClass('popup');
              this.st.mainClass = 'mfp-zoom-in';
            },
            open: function() {              
              	$.getScript(window.location.protocol + "//productreviews.shopifycdn.com/assets/v4/spr.js");
            },
            close: function() {
               $('.stickyHeader').removeClass('popup');
              $( '#content_quickview' ).empty();
            }
          },
        });
      },
      complete: function() {
        $('body').removeClass("loading");
      }
    })
    e.preventDefault();
    e.stopPropagation();
  });
})();

theme.Quotes = (function() {
  var config = {
    mediaQuerySmall: 'screen and (max-width: 749px)',
    mediaQueryMediumUp: 'screen and (min-width: 750px)',
    slideCount: 0
  };
  var defaults = {
    accessibility: true,
    arrows: true,
    dots: false,
    autoplay: false,
    touchThreshold: 20,
    rtl: theme.rtl,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  function Quotes(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var wrapper = this.wrapper = '.quotes-wrapper';
    var slider = this.slider = '#Quotes-' + sectionId;
    var $slider = $(slider, wrapper);

    var sliderActive = false;
    var mobileOptions = $.extend({}, defaults, {
      slidesToShow: 1,
      slidesToScroll: 1,
      rtl: theme.rtl,
      adaptiveHeight: true
    });

    config.slideCount = $slider.data('count');

    // Override slidesToShow/Scroll if there are not enough blocks
    if (config.slideCount < defaults.slidesToShow) {
      defaults.slidesToShow = config.slideCount;
      defaults.slidesToScroll = config.slideCount;
    }

    $slider.on('init', this.a11y.bind(this));

    enquire.register(config.mediaQuerySmall, {
      match: function() {
        initSlider($slider, mobileOptions);
      }
    });

    enquire.register(config.mediaQueryMediumUp, {
      match: function() {
        initSlider($slider, defaults);
      }
    });

    function initSlider(sliderObj, args) {
      if (sliderActive) {
        sliderObj.slick('unslick');
        sliderActive = false;
      }

      sliderObj.slick(args);
      sliderActive = true;
    }
  }

  Quotes.prototype = _.assignIn({}, Quotes.prototype, {
    onUnload: function() {
      enquire.unregister(config.mediaQuerySmall);
      enquire.unregister(config.mediaQueryMediumUp);

      $(this.slider, this.wrapper).slick('unslick');
    },

    onBlockSelect: function(evt) {
      // Ignore the cloned version
      var $slide = $('.quotes-slide--' + evt.detail.blockId + ':not(.slick-cloned)');
      var slideIndex = $slide.data('slick-index');
      $(this.slider, this.wrapper).slick('slickGoTo', slideIndex);
    },

    a11y: function(event, obj) {
      var $list = obj.$list;
      var $wrapper = $(this.wrapper, this.$container);

      $list.removeAttr('aria-live');
      $wrapper.on('focusin', function(evt) {
        if ($wrapper.has(evt.target).length) {
          $list.attr('aria-live', 'polite');
        }
      });

      // Remove aria-live
      $wrapper.on('focusout', function(evt) {
        if ($wrapper.has(evt.target).length) {
          $list.removeAttr('aria-live');
        }
      });
    }
  });
  return Quotes;
})();

theme.slideshows = {};

theme.SlideshowSection = (function() {
  function SlideshowSection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var slideshow = this.slideshow = '#Slideshow-' + sectionId;

    $('.slideshow__video', slideshow).each(function() {
      var $el = $(this);
      theme.SlideshowVideo.init($el);
      theme.SlideshowVideo.loadVideo($el.attr('id'));
    });

    theme.slideshows[slideshow] = new theme.Slideshow(slideshow);
  }

  return SlideshowSection;
})();

theme.SlideshowSection.prototype = _.assignIn({}, theme.SlideshowSection.prototype, {
  onUnload: function() {
    delete theme.slideshows[this.slideshow];
  },

  onBlockSelect: function(evt) {
    var $slideshow = $(this.slideshow);

    // Ignore the cloned version
    var $slide = $('.slideshow__slide--' + evt.detail.blockId + ':not(.slick-cloned)');
    var slideIndex = $slide.data('slick-index');

    // Go to selected slide, pause autoplay
    $slideshow.slick('slickGoTo', slideIndex).slick('slickPause');
  },

  onBlockDeselect: function() {
    // Resume autoplay
    $(this.slideshow).slick('slickPlay');
  }
});

// CATEGORY SLIDER
theme.collectionView = (function() {
  function collectionView(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id'),
    	sliderSecond = $container.attr('data-section-timeout');
    
    ajaxfilter = (function(url){
        var urlparam = getSearchParams(),
          urlparam = $.param( urlparam );

        if(urlparam){
          var splite_url = url.split('?');
          url = splite_url.join('?');
          //url = splite_url[0];
        }

        $.ajax({
          type: 'GET',
          url: url,
          data: {},
          beforeSend:function(){
            $('body').addClass('loading hideOverly');
          },
          complete: function (data) {

            $('.productList .grid-products').html($(".productList .grid-products", data.responseText).html());
            $('.productList .grid-products').html($(".productList .grid-products", data.responseText).html());
            $('.filters-toolbar__product-count').html($(".filters-toolbar__product-count", data.responseText).html());
            
            $('.sidebar_tags').html($(".sidebar_tags", data.responseText).html());
            check_filters();

            $('.pagination').html($(".pagination", data.responseText).html());
            if(!$(".pagination", data.responseText).html()){
              $('.pagination').hide();
            } else {
              $('.pagination').show();
            }
            $('.infinitpaginOuter').html($(".infinitpaginOuter", data.responseText).html());
            if(!$(".infinitpaginOuter", data.responseText).html()){
              $('.infinitpagin').remove();
            }
            if(theme.mlcurrency){ currenciesChange("sapn.money"); }
            $('body').removeClass('loading hideOverly');
            loadMoreBtn();

            if($(".spr-badge").length > 0) {
            	$.getScript(window.location.protocol + "//productreviews.shopifycdn.com/assets/v4/spr.js");
            }
            productGridView(sectionId);
            setTimeout(function(){ productGridView(sectionId); },1000);
			
            history.pushState({page: url}, url, url);
          }
        });
    });
    function getSearchParams(k){
      var p={};
      location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
      return k?p[k]:p;
    }
    
	$(window).on('load delayed-resize', function (e, resizeEvent) {
  		productGridView(sectionId);
    });
    
    infiniteScroll = function(){
      	var action = 'scroll load delayed-resize';
        $(window).on(action, function(){
          var moreURL = $('.infinitpagin a').attr('href');
          if ($('.infinitpagin a.infinite').length){
            var bottom = $('.infinitpagin').offset();
            var docTop = ($(document).scrollTop() + $(window).height() - 50);
            if( docTop > bottom.top){
              $(window).off(action);
              loadMore(moreURL);
            }
          }
        });
    }
    loadMoreBtn = function() {
		$('.infinitpagin a.loadMore').click(function(e){
          	e.preventDefault();
          	var moreURL = $(this).attr('href');
			loadMore(moreURL);
        });
    }
    
    loadMore = function(moreURL) {
      if (moreURL.length){
        $.ajax({
          type: 'GET',
          dataType: 'html',
          url: moreURL,
          beforeSend:function(){
          	if ($('.infinitpaginOuter').attr('data-type') == "button" ){
            	$('body').addClass('loading hideOverly');
            } else {
              $('.infinitpagin a').show();
            }
          },
          complete: function (data) {
            if($('.productList .grid-products').length){
            	$('.productList .grid-products').append($(".productList .grid-products", data.responseText).html());
            } else {
              	$('.productList .list-view-items').append($(".productList .list-view-items", data.responseText).html());
            }
            if($(".infinitpagin", data.responseText).html()){
            	$('.infinitpagin').html($(".infinitpagin", data.responseText).html());
            } else {
            	$('.infinitpagin').remove();
            }
			if(theme.mlcurrency){ currenciesChange("sapn.money"); }
            productGridView(sectionId);
			if($(".spr-badge").length > 0) {
                $.getScript(window.location.protocol + "//productreviews.shopifycdn.com/assets/v4/spr.js");
            }
            setTimeout(function(){ productGridView(sectionId); },1000);
            if ($('.infinitpagin a.loadMore').length){
            	loadMoreBtn();
            } else {
              infiniteScroll();
            }
            $('body').removeClass('loading hideOverly');
          }
        });
      }
    }
    
    $(document).ready(function(){
      infiniteScroll();loadMoreBtn();
      
      $("#collection-slideshow, #sideProdSlider").slick({
          dots: false,
          infinite: true,
          autoplay:true,
          autoplaySpeed:7000,
          speed:600,
          rtl: theme.rtl,
          slidesToShow:1,
          slidesToScroll:1
      });
    });
  }
  return collectionView;
})();

// Product grid same height
function productGridView(sectionId) {
  var gridRows = [],
  	  tempRow = [];

  productGridElements = $('#'+sectionId+' .grid-products .grid__item');
  productGridElements.each(function (index) {
    if ($(this).css('clear') != 'none' && index != 0) {
      gridRows.push(tempRow);
      tempRow = []; 
    }
    tempRow.push(this);

    if (productGridElements.length == index + 1) {
      gridRows.push(tempRow);
    }
  });

  $.each(gridRows, function () {
    var tallestBox = 0,
    	tallestHeight = 0,
        tallestswatch = 0;
    $.each(this, function () {
      $(this).find('.details').css('height', '');
      $(this).find('.grid-view_image a.grid-view-item__link').css('height', '');
      $(this).find('.swatches').css('height', '');
      bxHeight = parseInt($(this).find('.details').outerHeight());
      elHeight = parseInt($(this).find('.grid-view_image').outerHeight());
      swHeight = parseInt($(this).find('.swatches').outerHeight());
      if (elHeight > tallestHeight) { tallestHeight = elHeight; }
      if (bxHeight > tallestBox) { tallestBox = bxHeight; }
      if (swHeight > tallestswatch) { tallestswatch = swHeight; }
    });
    $.each(this, function() {
      $(this).find('.grid-view_image > a.grid-view-item__link').css('height', tallestHeight);
      $(this).find('.style3 .swatches').css('height', tallestswatch);
      $(this).find('.details').css('height', tallestBox);
    });
  });
}

theme.instagram = {};
theme.instagramSection = (function() {
  function instagramSection(container) {
    var $container = this.$container = $(container),
    	sectionId = $container.attr('data-section-id'),
        imgfrom = $container.attr('data-from'),
        user = $container.attr('data-user'),
        tag = $container.attr('data-tag'),
        imagesize = $container.attr('data-image'),
        num_photos = $container.attr('data-count');
    if(imgfrom == "user") {
      $.instagramFeed({'username': user, 'container': "#instafeed"+sectionId, 'items': num_photos, 'styling': false, 'image_size': imagesize });
    } else {
      $.instagramFeed({ 'tag': tag, 'container': "#instafeed"+sectionId, 'items': num_photos, 'styling': false, 'image_size': imagesize });
    }
    $("#instafeed"+sectionId+".insta-slick").slick();
  }
  return instagramSection;
})();

theme.carousel = (function(){
    function carousel(container) {
    	var $container = this.$container = $(container),
          sectionId = $container.attr('data-section-id'),
          carousel = $($container).find('.carousel'),
    	  tabs = this.tabs = '#' + sectionId + ' .tablink',
    	  tabcontent = this.tabcontent = '#' + sectionId + ' .tab-content';
    
    $(tabs).on('click', function(e){
        e.preventDefault();
        $(this).parent().addClass("active");
        $(this).parent().siblings().removeClass("active");
        var tab = $(this).attr("href");
        $(tabcontent).not(tab).css("display", "none");
        $(tab).fadeIn();
      	$(carousel).slick('refresh');
      	productGridView(sectionId+' '+tab);
    });
    $('#' + sectionId).each(function(){
		$(this).find('.collection-tabs li:first-child').addClass("active");
      	$(this).find('.tab-container .acor-ttl:first-child').addClass("active");
		$(this).find('.tab-container h3:first-child + .tab-content').show();
		var firsttab = $(this).find('.collection-tabs li:first-child a').attr("href");
    });
      
    // Recenttly Viewed
    if(sectionId == "recently-viewed"){
        var recentcookie = "recentproducts",
            crproduct = $container.attr('data-pr');
        $.ajax({
          url: '/pages/recently-viewed-products/'+$.cookie(recentcookie)+'__pr='+crproduct,
          dataType: 'html',
          type: 'GET',
          success: function(data) {
            if($(data).find('.grid-view-item').length){
            	$('#productSlider-recently-viewed').html(data);
            }
          },
          error: function(data) {
            console.log('ajax error');
          },
          complete: function() {
            $(carousel).slick('refresh');
            productGridView(sectionId);
            setTimeout(function(){ productGridView(sectionId); },1500);
            if (theme.mlcurrency){currenciesChange("#productSlider-recently-viewed span.money");}
          }
        });
    }

    $(carousel).slick();
    productGridView(sectionId);
    setTimeout(function(){ productGridView(sectionId); },1500);
	$(window).on('delayed-resize', function (e, resizeEvent) {
  		productGridView(sectionId);
    });
  }
  return carousel;
})();

theme.masonary = (function(){
    function masonary(container){
    	var $container = this.$container = $(container),
          sectionId = $container.attr('data-section-id'),
          masonary = this.masonary = $($container).find('.grid-masonary');
    
      loadMasonary(masonary);
      setTimeout( function(){ loadMasonary(masonary); },1000);
      function loadMasonary(masonary) {
        $(masonary).masonry({
            columnWidth: '.grid-sizer-'+sectionId,
            itemSelector: '.ms-item',
            percentPosition: true
        });
      }
  }
  return masonary;
})();

theme.ajaxCart = function(){
  	drawerTimeout: null,
  	quickshop(),gridAddToCart(),prodAddToCart(),wishlist(),updateWishlist(),freeship();

	$(".continue-shopping, .modalOverly, .closeDrawer").click(function(){
        $(".modal").fadeOut(200);
    	$("body").removeClass("loading showOverly");
    });
  	function quickshop() {
      $(document).on('click touchend', '.quickShop', function(e){
          e.preventDefault(); e.stopImmediatePropagation();
          var url = $(this).attr('href'),
              imgwrapper = $(this).parents(".grid-view_image"),
              wrapper = $(this).parents(".grid-view-item").find('.shopWrapper');
          $.ajax({
            url: url,
            dataType: 'html',
            type: 'GET',
            beforeSend:function(){
              $(imgwrapper).addClass('showLoading');
            },
            success: function(data) {
              $(".shopWrapper").removeClass('active').html("");
              $(wrapper).addClass('active').html(data);
            },
            complete: function(data){
              $(imgwrapper).removeClass('showLoading');
              if (theme.mlcurrency){ currenciesChange(".shopWrapper.active .product-single__price span.money"); }
              $(".closeShop").click(function(e){
                $(this).parents(".shopWrapper").removeClass("active");
              });
            }
          });
      });
    }
  	function gridAddToCart() {
      $(document).on('click touchend', '.add-to-cart', function(i){
        i.preventDefault(); i.stopImmediatePropagation();
          if (theme.ajax_cart) {
            var att = $(this).attr("id"),
            	qty = $(this).attr("rel");
            addinToCart(att, qty);
          } else {
            $(this).next().submit();
          }
        return;
      });
    }
    function prodAddToCart(){
      $(document).on('click touchend', '.product-form__cart-submit', function(i){
        if (i.preventDefault(), "disabled" != $(this).attr("disabled"))
          if (theme.ajax_cart) {
            var att = $(this).closest("form").find("select[name=id]").val();
            	att || (att = $(this).closest("form").find("input[name=id]").val());
            var qty = $(this).closest("form").find("input[name=quantity]").val();
            	qty || (qty = 1);
            var props = {};
            $('[name*="properties"]').each(function() {
              var key = $(this).attr('name').split('[')[1].split(']')[0];
              var value = $(this).val();
              props[key] = value;
            });
            addinToCart(att, qty, props);
          } else {
            $(".productForm").submit();
          }
        return;
      });
    }
    function addinToCart(att, qty, props){
      $("body").addClass("loading");
      CartJS.addItem(att, qty,props,{
          "success": function(data, textStatus, jqXHR){
             setTimeout(function() {
             	$("body").removeClass("loading showOverly");
             	$(".block-cart").addClass("active");
             },1000);
             drawerTimeout = setTimeout(function() {
                $(".block-cart").removeClass("active");
             }, 7000);
          },
          "error": function(jqXHR, textStatus, errorThrown){
            var errormsg = JSON.parse(jqXHR.responseText).description;
            $("body").removeClass("loading");
            $(".error-message").text(errormsg);
            $("body").addClass("showOverly");
              $("#errorDrawer").fadeIn(500);
              drawerTimeout = setTimeout(function(){
                  $("body").removeClass("loading showOverly"), $("#errorDrawer").fadeOut(200)
              }, 6000);
          }
      });
    }
  	$(document).on('cart.requestComplete', function(event, cart) {
      	if(theme.mlcurrency){ currenciesChange("#cart-drawer sapn.money"); }
        setTimeout(function(){ freeship(); }, 3000);
    });
    function freeship() {
         var freeshipPrice = $(".freeShipMsg").attr('data-price'),
             freeshiptotal = freeshipPrice+'00',
             cartTotal = CartJS.cart.total_price,
             remainfreeship = freeshiptotal-cartTotal;
         if(remainfreeship>0){
         	$(".freeShipMsg .freeShip").html(theme.Currency.formatMoney(remainfreeship, theme.moneyFormat));
            $(".freeShipMsg").show(); $('.freeShipclaim').hide();
            if(theme.mlcurrency){
            	currenciesChange(".freeShipMsg .freeShip sapn.money");
            }
         } else {
			$(".freeShipMsg").hide(); $('.freeShipclaim').show();
         }
    }
  	function wishlist() {
       var cookieName = "wishlistList";
       $(document).on('click', '.addto-wishlist', function(e){
           e.preventDefault();
             var id = $(this).attr('rel');
             if($.cookie(cookieName) == null) {
               var str = id;
             } else {
               if($.cookie(cookieName).indexOf(id) == -1) {
                 var str = $.cookie(cookieName) + '__' + id;
               }
             }
             $.cookie(cookieName, str, {expires:30, path:'/'});
             $(this).find(".ad").removeClass('ad-heart-l').addClass('ad-circle-notch-r ad-spin');
             setTimeout(function(){
               $('.wishlist[rel="'+id+'"]').removeClass('addto-wishlist').find('span').text(theme.wlAvailable);
               $('.wishlist[rel="'+id+'"] .ad').removeClass('ad-circle-notch-r ad-spin').addClass('ad-heart');
             }, 2000);
         })
     }
     function updateWishlist() {
       var cookieName = "wishlistList";
       try {
         if($.cookie(cookieName) != null && $.cookie(cookieName) != '__' && $.cookie(cookieName) != '') {
           var str = String($.cookie(cookieName)).split("__");
           for (var i=0; i<str.length; i++) {
             if (str[i] != '') {
               $('.wishlist[rel="'+str[i]+'"]').removeClass('addto-wishlist').find('span').text(theme.wlAvailable);
               $('.wishlist[rel="'+str[i]+'"] .ad').removeClass('ad-heart-l').addClass('ad-heart');
             }
           }
         }
       }
       catch (err) {}
     }
};
$(theme.ajaxCart);


$(document).ready(function() {
  
  var sections = new theme.Sections();

  sections.register('header-section', theme.HeaderSection);
  sections.register('cart-template', theme.Cart);
  sections.register('product', theme.Product);
  sections.register('collection-template', theme.Filters);
  sections.register('collection-template', theme.collectionView);
  sections.register('product-template', theme.Product);
  sections.register('map', theme.Maps);
  sections.register('slideshow-section', theme.SlideshowSection);
  sections.register('carousel', theme.carousel );
  sections.register('quotes', theme.Quotes);
  sections.register('masonary', theme.masonary);
  sections.register('instagram', theme.instagramSection);
});

var resizeTimer;
  $(window).resize(function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      $(window).trigger('delayed-resize');
    }, 250);
});

theme.init = function() {
  theme.customerTemplates.init();

  slate.rte.wrapTable();
  slate.rte.iframeReset();

  // Common a11y fixes
  slate.a11y.pageLinkFocus($(window.location.hash));

  $('.in-page-link').on('click', function(evt) {
    slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
  });

  $('a[href="#"]').on('click', function(evt) {
    evt.preventDefault();
  });

};
$(theme.init);

$(document).ready(function() {
  "use strict";
  
  	$(".saleTime").each(function(){
      var $this = $(this),
      	  date = $(this).data('date'),
      	  countDownDate = new Date(date).getTime();

		var x = setInterval(function(){
          var now = new Date().getTime(),	            
              distance = countDownDate - now,
              days = Math.floor(distance / (1000 * 60 * 60 * 24)),
              hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
              seconds = Math.floor((distance % (1000 * 60)) / 1000);

          if(days > 99){
            days = ("00" + days).substr(-3);
          } else {
            days = ("00" + days).substr(-2);
          }
          hours = ("00" + hours).substr(-2);
          minutes = ("00" + minutes).substr(-2);
          seconds = ("00" + seconds).substr(-2);

          $($this).find(".counter").html("<span class='days'>" + days + "<span>"+theme.days+"</span></span> <span class='hours'>" + hours + "<span>"+theme.hours+"</span></span> <span class='minutes'>"+ minutes + "<span>"+theme.minuts+"</span></span> <span class='seconds'>" + seconds + "<span>"+theme.seconds+"</span>");

          if (distance < 0){
          	clearInterval(x); $($this).hide();
		  }
		}, 1000);
  	});
  
   // LOOKBOOK SHOP 
	$('.btn-shop').click(function(){
       $('.products .grid-lb, .grid-lookbook').removeClass('active');
       $(this).next().addClass('active');
       $(this).parents('.grid-lookbook').addClass('active');
	});
	$('.btn-shop-close').click(function(){     
    	$(this).parent().removeClass('active');
	});

  	// PROMOTION HEADER show-hide
	if($.cookie('promotion') != 'true') {
    	$(".notification-bar").show();      
  	}
	$(".close-announcement").click(function() {   
		$(".notification-bar").slideUp();  
		$.cookie('promotion', 'true', { expires: 1, path:'/'});
	});
  
	// SHOW HIDE PRODUCT Filters
	$('.btn-filter').click(function(){
    	$(".filterbar").toggleClass("active");
	});
	$('.closeFilter').click(function(){
		$(".filterbar").removeClass("active");
	});
	$("body").click(function(event ){
    	var $target = $(event.target);
    	if(!$target.parents().is(".filterbar") && !$target.is(".filterbar")&& !$target.is(".btn-filter")){
      		$(".filterbar").removeClass("active");
    	}
	});
  
  // STICKY HEADER
  window.onscroll = function(){ scrollFunction() };
  function scrollFunction() {
	if (theme.fixedHeader){
		if($(window).scrollTop()>145) {     
            $('#headerWrapper').addClass("stickyHeader animated fadeInDown");
          	$('#header').css("min-height",$('#headerWrapper').height());
    	} else {
            $('#headerWrapper').removeClass("stickyHeader fadeInDown");
          	$('#header').css("min-height",'');
        }
    }
    
    /// sticky cart 
    if($(window).scrollTop()>600 && $(".stickyCart").length){
      	$("body.template-product").css('padding-bottom','70px');
        $(".stickyCart").slideDown();
    } else {
      	$("body.template-product").css('padding-bottom','0');
        $(".stickyCart").slideUp();
    }

    // SITE SCROLLER
    if($(window).scrollTop()>200){
      $("#site-scroll").fadeIn();
    } else {
      $("#site-scroll").fadeOut();
    }
  }
  
  $("#site-scroll").click(function() {
    $("html, body").animate({ scrollTop: 0 }, 1000);
    return false;
  }); 
  
   //Footer links for mobiles
  $(".footer-links .h4").click(function() {
    if($(window).width() < 750){
      $(this).toggleClass("active");
      $(this).next().slideToggle();
  	}
  });
  
  $(".qtyBtn").on("click", function() {
      var qtyField = $(this).parent(".qtyField"),
         oldValue = $(qtyField).find(".qty").val(),
          newVal = 1;

      if ($(this).is(".plus")) {
        newVal = parseInt(oldValue) + 1;
      } else if (oldValue > 1) {
        newVal = parseInt(oldValue) - 1;
      }
      $(qtyField).find(".qty").val(newVal);
  });

  $(document).on('click', '.grid-view-item .swatches li:not(.noImg)', function(e){
        var newImage = $(this).attr('rel'),
          boxOuter = $(this).parents('.grid-view-item'),
          color = $(this),
          colorlist = $(this).parents('.swatches').children(".swatch");
		$(boxOuter).find('.grid-view_image').addClass("showLoading");
        $(boxOuter).find('.variantImg').attr({ src: newImage });
        $(boxOuter).find('.variantImg').load(function(){
        	$(colorlist).removeClass("active");
      		$(color).addClass("active");
        	$(this).parents('.swatches').children(".swatch").addClass('active');
        	$(boxOuter).find('.grid-view_image').removeClass("showLoading").addClass("showVariantImg");
		});
	return false;
  });
   
  
  
  // Site Animation
  if(theme.animationMobile) {
      if($(window).width() < 767) {
          $('.wow').removeClass('wow');   
      }
  }
  if(theme.animation) {
    new WOW().init();
  }
  
   // Shipping Calculator
  if($("#shipping-calculator").length) {
    Shopify.Cart.ShippingCalculator.show({
      submitButton: theme.strings.shippingCalcSubmitButton,
      submitButtonDisabled: theme.strings.shippingCalcSubmitButtonDisabled,
      customerIsLoggedIn: theme.strings.shippingCalcCustomerIsLoggedIn,
      moneyFormat: theme.strings.moneyFormat
    });
  } 
});