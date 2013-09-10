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
                console.log($('.current').data('date'))
            } else {
                date = new Date()
            }
            console.log(date)
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

function formatDate(date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')
}

function saveEventToLocalStorage(date, event) {
    console.log(event + 'save')

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

$(document).ready(function() {
    bindButtonHandlers()
    _globalDate = new Date()
    renderPage(_globalDate)
})