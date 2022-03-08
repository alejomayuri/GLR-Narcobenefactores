$(document).ready(function () {
    document.onscroll = function () {
        window.scrollY >= 7 || window.pageYOffset >= 7 ?
            $('#w-header').addClass('sticky-gray')
            :
            $('#w-header').removeClass('sticky-gray')
    }
})

$(window).on("scroll", function () {
    checkScroll(this);
    
});

function checkScroll(that) {
    var scroll_top = $(that).scrollTop();
    var window_height = $(window).height();
    var ref_line = scroll_top + 0.5 * window_height;
    // console.log(scroll_top,  window_height, ref_line)
    

    $(".slides-map").each(function () {
        var selector = $(this).find(".slide");
        var n = selector.length;
        // console.log(selector, n)
        selector.each(function (i) {
            var sec_top = $(this).offset().top - 100;
            var sec_height = $(this).height();
            // console.log(sec_top, sec_height)
            if (sec_top < ref_line && ref_line < sec_top + sec_height) {
                $(this).find(".slide__content").addClass("visible");
                $(this).find(".slide__content").addClass('carrusel-fixed')
                $(this).find(".slides-map").addClass('carrusel-fixed')
            } else {
                $(this).find(".slide__content").removeClass("visible");
                
            }
            if (i == 0) {
                if (scroll_top < sec_top) {
                    $(this).find(".slide__content").addClass("fit-to-top");
                    
                } else {
                    $(this).find(".slide__content").removeClass("fit-to-top");
                }
            }
            if (i == n - 1) {
                if (scroll_top + window_height > sec_top + sec_height) {
                    $(this).find(".slide__content").addClass("fit-to-bottom");
                //     $(this).find(".slide__content").removeClass('carrusel-fixed')
                // $(this).find(".slides-map").removeClass('carrusel-fixed')
                   
                } else {
                    $(this).find(".slide__content").removeClass("fit-to-bottom");
                    
                }
            }
        });
    });
}

checkScroll(window);