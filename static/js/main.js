(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });


    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
        nav : false
    });

    // //Data Status Chart
    // var ctx1 = $("#bar-chart").get(0).getContext("2d");
    // var myChart1 = new Chart(ctx1, {
    //     type: 'bar',  // 'horizontalBar' in Chart.js 2.x; use 'bar' with indexAxis in Chart.js 3.x or later
    //     data: {
    //         labels: [],
    //         datasets: [{
    //             backgroundColor: [
    //                 "rgba(0, 156, 255, 0.7)",
    //                 "rgba(0, 156, 255, 0.5)",
    //                 "rgba(0, 156, 255, 0.3)"
    //             ],
    //             data: [0, 0, 0] // Example data percentages for neutral, positive, negative
    //         }]
    //     },
    //     options: {
    //         indexAxis: 'y',  // Only for Chart.js 3.x or later, make sure this is set for horizontal bar charts
    //         responsive: true,
    //         scales: {
    //             x: {  // 'xAxes' in Chart.js 2.x
    //                 ticks: {
    //                     beginAtZero: true,
    //                     callback: function(value) {
    //                         return value + "%"; // Appends a '%' sign after each value on the x-axis
    //                     }
    //                 }
    //             }
    //         },
    //         plugins: {
    //         legend: {
    //             display: false  // Hides the legend
    //         }
    //     }
    //     }
    // });

    
    
})(jQuery);

