d('Carousel3d').plugin(function(){
    var $slides = this,
    carousel = {
        init: function() {
            this.init_slides();
            this.bind_events();

            this.rvu_head = d('#review-head').html();
            this.rvu_cont = d('#review-cont').html();
            this.rvu_nodata =  d('#review-nodata').html();
            this.load_reviews(1000004);
        },
        bind_events: function() {
            $slides.nodes('ul').on('click',this.rotate);
        },
        init_slides: function() {
            this.open_slides = 5;
            this.slides = $slides.nodes('li').d;
            var now_idx = this.slides.length/2-1;
            this.now = this.slides[now_idx];
            // target animation values
            this.to = {fr:{s:0},fl:{s:4},
              xy:[{top:0,left:0,zindex:1,width:112,height:160,opacity:0.15,span:0},
                  {top:20,left:98,zindex:2,width:196,height:280,opacity:0.4,span:0},
                  {top:40,left:253,zindex:3,width:280,height:400,opacity:1,span:0.6},
                  {top:20,left:498,zindex:2,width:196,height:280,opacity:0.4,span:0},
                  {top:0,left:684,zindex:1,width:112,height:160,opacity:0.15,span:0}
            ]};
        },
        rotate: function(e) {
            $li = d(e.target).parent();
            // for two-way carousel
            /*if($li.has_class('fr')) {
                carousel.slideit('fl', 'fr');
            } else if($li.has_class('fl')) {
                carousel.slideit('fr', 'fl');
            }*/
            carousel.slideit('fr', 'fl');
        },
        slideit: function(_t,_f) {
            var to = this.to.xy;            
            var from = this.current_props();
            var self = this;
            d.animate({
              delay: 30,
              duration: 500, // 1 sec by default
              delta: d.easing.ease_out(d.easing.linear),
              step: function(delta) {
                //for(i=self.to[_t].s;i<=self.to[_f].s;i++) {
                for(i=0;i<=4;i++) {    
                    // cache current slide
                    var c_slide = self.slides[i];
                    // move the li
                    c_slide.style.left = (to[i].left-from[i].left)*delta +from[i].left+ 'px';
                    c_slide.style.top = (to[i].top-from[i].top)*delta +from[i].top+ 'px';
                    // move the image
                    var _img = d(c_slide).first().eq();
                    _img.style.width = (to[i].width-from[i].width)*delta +from[i].width+ 'px';
                    _img.style.height = (to[i].height-from[i].height)*delta +from[i].height+ 'px';
                    // for in-title
                    d(c_slide).last().opacity((parseFloat((to[i].span-from[i].span)*delta)+parseFloat(from[i].span))*100)
                    // fade in/out
                    d(c_slide).opacity((parseFloat((to[i].opacity-from[i].opacity)*delta)+parseFloat(from[i].opacity))*100);
                    // stack it
                    if(parseInt(delta*10)>3) {
                        c_slide.style.zIndex = to[i].zindex;
                    }
                }
              },
              parkit: function() {self.slided(_t,_f);}
            });
        },
        slided: function(dir,frm) {
            if(dir==='fr') {
                var _f=d('#slides > ul').before(this.slides[this.slides.length-1],this.slides[0]);
                _f.el.style.top = '0';
                _f.el.style.left = '0';
                _f.el.style.zIndex = '0';
                _f.replace_class('fr','fl');
                _f.opacity(0);

                var _lp = d(this.slides[this.slides.length-2]);
                _lp.el.style.top = '0';
                _lp.el.style.left = '684px';
                _lp.el.style.zIndex = '0';
                _lp.opacity(0);
            } else if(dir==='fl') {
                var _f=d('#slides > ul').append(this.slides[0]);
                _f.el.style.top = '0';
                _f.el.style.left = '684px';
                _f.el.style.zIndex = '0';
                _f.replace_class('fl','fr');
                _f.opacity(0);
            }
            // identify the center slide
            d('#slides > ul li.fc').replace_class('fc',dir).prev().replace_class(frm,'fc');
            // reset the slides
            this.init_slides();
            // load the relevant reviews
            this.load_reviews(d('#slides > ul li.fc').eq().className.match(/P([0-9]*)/)[1]);
        },
        current_props: function() {
            var from = {};
            for(i=this.to.fr.s;i<this.open_slides;i++) {
                var c_slide = this.slides[i];
                from[i] = {};
                from[i].left = parseInt(c_slide.style.left);
                from[i].top = parseInt(c_slide.style.top);
                from[i].opacity = c_slide.style.opacity;

                var _img = d(c_slide).first().eq();
                from[i].width = parseInt(_img.style.width);
                from[i].height = parseInt(_img.style.height);

                from[i].span = d(c_slide).last().eq().style.opacity;
            }
            return from;
        },

        load_reviews: function(id) {
            var qs='?apiversion=5.1&passkey=kuy3zj9pr3n7i0wxajrzj04xo&Filter=ProductId:'+id+'&Include=Products&Stats=Reviews';
            var self = this;
            d.load_json('http://stg.api.bazaarvoice.com/data/reviews.json'+qs, function(data){
                if(!data.HasErrors && data.TotalResults>0) {
                    d('#details').empty();
                    var _p = data.Includes.Products[id];
                    var head = _.template(self.rvu_head)({product_name:_p.Name,product_desc:_p.Description});
                    d('#details').append(d.to_dom(head));
                    var _r = data.Results;
                    for(j=0;j<data.Results.length;j++) {
                        var article = _.template(self.rvu_cont)({title:_r[j].Title,nickname:_r[j].UserNickname,rating:_r[j].Rating,review_text:_r[j].ReviewText});
                        d('#details').append(d.to_dom(article));
                    }
                } else {
                    d('#details').html(self.rvu_nodata);
                }
            });
        }
    };

    carousel.init();
});