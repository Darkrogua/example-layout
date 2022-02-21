let leftMenu = {
    changeWidth(width)
    {
        if (width < 992) {
            this.closeAllChapters()
        }
        else {
            this.openAllChapters()
        }
    },
    closeAllChapters()
    {
        $('.left-menu__chapter__items').hide()
        $('.left-menu__chapter__title').addClass('closed')

    },
    openAllChapters()
    {
        $('.left-menu__chapter__items').show()
        $('.left-menu__chapter__title').removeClass('closed')
    },
    itemsLimiter()
    {
        $('.left-menu__chapter__items').map((i, node) => {
            node = $(node)
            let items = node.find('a')
            if (items.length > 15) {
                node.addClass('items-limiter')
            }
        })
    }
}

$(document).ready(function () {
    leftMenu.changeWidth($('body').width())
    leftMenu.itemsLimiter()
    $('.left-menu').show()
})

$(window).resize(function() {
    leftMenu.changeWidth($('body').width())
})

$(document).on('click', '.left-menu__chapter__title', function () {
    if ($(this).next('.left-menu__chapter__items').css('display') === 'block') {
        $(this).next().slideUp(100)
        $(this).addClass('closed')
    }
    else {
        $(this).next().slideDown(100)
        $(this).removeClass('closed')
    }
})

$(document).on('click', '.left-menu__chapter__limiter', function () {
    $(this).prev().toggleClass('deployed')
})
