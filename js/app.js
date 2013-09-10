function Month() {
    
}

function getDayOfWeek(date) {
    var dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    return dayNames[date.getDay()]
}

function getNameOfMonth(date) {
    var monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    return monthNames[date.getMonth()]
}

function getCorrectedDay(date) {
    return date.getDay() == 0 ? 6 : date.getDay() - 1
}

function getPrettyDate(date) {
    var monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    return [date.getDate(), monthNames[date.getMonth()]].join(' ')
}

function formatDate(date) {
    var year = date.getFullYear()
    var month = ('0' + (date.getMonth() + 1)).slice(-2)
    var day = ('0' + date.getDate()).slice(-2)
    return [year, month, day].join('-')
}

function renderTableCell(date, firstRow) {
    var cellTitle = date.getDate()
    if (firstRow) {
        cellTitle = [getDayOfWeek(date), cellTitle].join(', ')
    }
    var cellBody = loadEventFromLoadStorage(date)
    var cell = $('<td></td>')
    if (cellBody) {
        cell.addClass('reminder')
    }
    cell.append($('<span></span>').addClass('cell-title').html(cellTitle))
    cell.append($('<div></div>').addClass('cell-body').html(cellBody))
    cell.data('date', formatDate(date))
    return cell
}

function renderCalendar(date) {
    var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    var dayOfWeek = getCorrectedDay(firstDayOfMonth)
    var currentDate = new Date(firstDayOfMonth)
    currentDate.setDate(currentDate.getDate() - dayOfWeek)

    var tableRow = null
    var firstRow = true
    var calendar = $('.calendar')
    calendar.empty()
    while (true) {
        if (tableRow == null) {
            tableRow = $('<tr></tr>')
        }
        tableRow.append(renderTableCell(currentDate, firstRow))
        if (tableRow.children('td').length == 7) {
            calendar.append(tableRow)
            tableRow = null
            firstRow = false
            if (currentDate.getMonth() != date.getMonth()) {
                break
            }
        }
        currentDate.setDate(currentDate.getDate() + 1)
    }
    if (tableRow != null) {
        calendar.append(tableRow)
    }
}

function renderCurrentMonth(date) {
    $('.current-month').html([getNameOfMonth(date), date.getFullYear()].join(' '))
}

function bindTableHandlers() {
    $('td').click(function(event) {
        $('td').removeClass('current')
        $(this).addClass('current')
    })
}

function bindButtonHandlers() {
    $('.button-left').click(function(event) {
        _globalDate.setMonth(_globalDate.getMonth() - 1)
        renderPage(_globalDate)
    })

    $('.button-right').click(function(event) {
        _globalDate.setMonth(_globalDate.getMonth() + 1)
        renderPage(_globalDate)
    })


    $('.button-today').click(function(event) {
        _globalDate = new Date()
        renderPage(_globalDate)
    })

    $('.button-new').click(function(event) {
        $('.create-box').show()
        $('.button-new').attr('disabled', 'disabled')
    })

    $('.button-create').click(function(event) {
        $('.create-box').hide()
        $('.button-new').attr('disabled', false)

        if (window.localStorage) {
            var date
            if ($('.current').length > 0) {
                date = new Date(Date.parse($('.current').data('date')))
            } else {
                date = new Date()
            }
            saveEventToLocalStorage(date, $('.create-input').val())
            $('.create-input').val('')
            renderPage(_globalDate)
        }
    })

    $('.button-cancel-create').click(function(event) {
        $('.create-box').hide()
        $('.button-new').attr('disabled', false)
    })
}

function renderSearchItem(date, event) {
    var listItem = $('<li></li>')
    listItem.addClass('search-item')
    listItem.append($('<div></div>').addClass('search-item-event').html(event))
    listItem.append($('<div></div>').addClass('search-item-date').html(getPrettyDate(date)))
    listItem.data('date', formatDate(date))
    listItem.click(function(event) {
        _globalDate = date
        renderPage(_globalDate)
    })
    return listItem
}

function bindSearchHandler() {
    $('.search-form').submit(function(event) {
        event.preventDefault()
    })
    $('.search-input').keyup(function(event) {
        if (event.keyCode == 27) {
            $('.search-wrapper').hide()
            $('.hidden-scrollbar').scrollTop(0)
            return
        }

        $('.search-wrapper').show()
        var items = $('.search-items')
        items.empty()
        $('.hidden-scrollbar').scrollTop(0)
        for(var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i)
            var value = localStorage.getItem(key)
            var timestamp = Date.parse(key)
            if (!isNaN(timestamp) && value.indexOf($('.search-input').val()) != -1) {
                items.append(renderSearchItem(new Date(key), value))
            }
        }
    })
}

function saveEventToLocalStorage(date, event) {
    var key = formatDate(date)
    var value = event
    localStorage.setItem(key, value)
}

function loadEventFromLoadStorage(date) {
    var key = formatDate(date)
    var value = localStorage.getItem(key)
    return value
}

function renderPage(date) {
    renderCalendar(date)
    renderCurrentMonth(date)
    bindTableHandlers()
}

function bindScrollBar() {
    var hiddenScroll = $('.hidden-scrollbar')
    var customScroll = $('.custom-scrollbar')
    var search = $('.search')
    var searchItems = $('.search-items')
    var mouse = false
    var savedScrollPosition = 0

    hiddenScroll.scroll(function(event) {    
        var divHeight = search.height() - customScroll.outerHeight(true)
        var ulHeight = hiddenScroll.get(0).scrollHeight - hiddenScroll.height()

        var position = hiddenScroll.scrollTop() / ulHeight
        var scrollPosition = position * divHeight
        customScroll.css('top', scrollPosition + 'px')

        if (!mouse) {
            savedScrollPosition = scrollPosition
        }
    })

    customScroll.bind('mousedown', function(event) {
        var startPosition = event.clientY
        var divHeight = search.height() - customScroll.outerHeight(true)
        var ulHeight = hiddenScroll.get(0).scrollHeight - hiddenScroll.height()
        mouse = true

        $(document).bind('mousemove', function(event) {
            var scrollPosition = (event.clientY - startPosition) + savedScrollPosition;
            var contentPosition = scrollPosition / divHeight
            hiddenScroll.scrollTop(ulHeight * contentPosition)
        })

        $(document).bind('mouseup', function(event) {
            savedScrollPosition = hiddenScroll.scrollTop() / ulHeight * divHeight
            $(document).unbind('mousemove', mousemove)
            mouse = false
        })
    })

    $('.search-wrapper').bind('selectstart', function() {
        return false
    })

    $('.search-items').scroll(function() {
        this.scrollTop = 0
        this.scrollLeft = 0
    })
}

$(document).ready(function() {
    bindButtonHandlers()
    bindSearchHandler()
    bindScrollBar()
    _globalDate = new Date()
    renderPage(_globalDate)
})