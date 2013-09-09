function getDayOfWeek(date) {
    var dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    return dayNames[date.getDay()]
}

function getNameOfMonth(date) {
    var monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    return monthNames[date.getMonth()]
}

function myGetDay(date) {
    return date.getDay() == 0 ? 6 : date.getDay() - 1
}

function renderTableCell(date, firstRow) {
    var cellText = date.getDate()
    if (firstRow) {
        cellText = getDayOfWeek(date) + ', ' +cellText
    }
    return $('<td></td>').html(cellText)
}

function renderCalendar(date) {
    var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    var dayOfWeek = myGetDay(firstDayOfMonth)
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