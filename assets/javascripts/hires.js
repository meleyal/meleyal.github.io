var permalink_page = false;
var tag = '';
var tag_page = false;

function resize_video(v) {
  if (!v)
    return;

  try {
    var video_width = parseInt(800);
    var video_height = Math.round(video_width / (v.width / v.height));
    v.width = video_width;
    v.height = video_height;
    v.setStyle('width', video_width + 'px');
    v.setStyle('height', video_height + 'px');
  } catch (e) {
    console.log(e);
  }
}

function resize_tumblr_video(v) {
  if (!v)
    return;

  try {
    var w = parseInt(v.getStyle('width'));
    var h = parseInt(v.getStyle('height'));

    var video_width = parseInt(800);
    var video_height = Math.round(video_width / (w / h));

    v.width = video_width;
    v.height = video_height;

    v.setStyle('width', video_width + 'px');
    v.setStyle('height', video_height + 'px');

    v.getElements('iframe').each(resize_video);
  } catch (e) {
    console.log(e);
  }
}

function fix_highres_image(img) {
  if (!img)
    return;

  try {
    var a = img.getParent();
    if (a && a.href && a.href.indexOf(document.domain + '/image/') != -1) {
      a.href = img.title;
      img.title = img.alt;
    }
  } catch (e) {
    console.log(e);
  }
}

function adjust_ios_viewport() {
  var w1 = parseInt(700);
  var w2 = parseInt(1110);
  var w3 = parseInt(800);

  var widest = w1 > w2 ? w1 : w2;
  widest = w3 > widest ? w3 : widest;

  var margin = parseInt(64);
  var viewport_width = margin + widest + margin;
  if (viewport_width > 768) {
    try {
      $('viewport').setProperty('content', 'width = ' + viewport_width);
    } catch (e) {
      console.log(e);
    }
  }
}

adjust_ios_viewport();

if (!permalink_page)
  $$('img.photo_img').each(fix_highres_image);

$$('.video > object').each(resize_video);
$$('.video > embed').each(resize_video);
$$('.video > iframe').each(resize_video);
$$('.tumblr_video_container').each(resize_tumblr_video);

var current_page = 1;
var total_pages = 1;
var locked = false;

if (current_page == total_pages || total_pages == 0)
  $('pagers').dispose();

var loaded_posts = [];
$$('li.post').each(function(li) {
  loaded_posts.push(li.id);
});

function fix_flash_audio(js) {
  if (!js)
    return;

  var lines = [];
  try {
    var newline = eval('\"\\' + 'n\"');
    lines = js.split(newline);
  } catch (e) {
    console.log(e);
  }

  for (var i = 0; i < lines.length; i++) {
    if (lines[i].contains('replace' + 'If' + 'Flash'))
      eval(lines[i]);
  }
}

var ajax = new Request.HTML({
  evalScripts: false,
  onFailure: function() {
    locked = false;
  },
  onSuccess: function(tree, elements, html, js) {
    elements.each(function(el) {
      if (el.tagName == 'LI' && el.hasClass('post') && !loaded_posts.contains(el.id)) {
        $('posts').adopt(el);
        loaded_posts.push(el.id);

        el.getElements('img.photo_img').each(fix_highres_image);
        el.getElements('.video > object').each(resize_video);
        el.getElements('.video > embed').each(resize_video);
        el.getElements('.video > iframe').each(resize_video);
        el.getElements('.tumblr_video_container').each(resize_tumblr_video);

      }

    });

    try {
      fix_flash_audio(js);
    } catch (e) {
      console.log(e);
    }

    current_page++;
    locked = false;

    if (current_page == total_pages)
      $('pagers').dispose();
  }
});

function more() {
  if (!locked && current_page != total_pages && total_pages > 0) {
    locked = true;
    url = (tag_page ? '/tagged/' + tag : '') + '/page/' + (current_page + 1).toString();
    return ajax.get(url);
  }
}

function prox() {
  var window_height = $(window).getSize().y;
  var document_height = $(window).getScrollSize().y;
  var scroll_position = $(window).getScroll().y;

  if (document_height - (window_height + scroll_position) < 1600) {
    more();
  } else {
    locked = false;
  }
}

$(window).addEvent('resize', prox);
$(window).addEvent('scroll', prox);
