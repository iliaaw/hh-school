function getDayOfWeek(date) {
    var dayName = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    return dayName[date.getDay()]
}

function myGetDay(date) {
    return date.getDay() == 0 ? 6 : date.getDay() - 1
}

function buildCell(date, firstRow) {
    var cellText = date.getDate()
    if (firstRow) {
        cellText = getDayOfWeek(date) + ', ' +cellText
    }
    return $('<td></td>').html(cellText)
}

function renderMonth(date) {
    var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    var dayOfWeek = myGetDay(firstDayOfMonth)
    var currentDate = new Date(firstDayOfMonth)
    currentDate.setDate(currentDate.getDate() - dayOfWeek)

    var tableRow = null;
    var firstRow = true;
    var calendar = $('.calendar')
    while (true) {
        if (tableRow == null) {
            tableRow = $('<tr></tr>')
        }
        tableRow.append(buildCell(currentDate, firstRow))
        if (tableRow.children('td').length == 7) {
            calendar.append(tableRow)
            tableRow = null
            firstRow = false
            if (currentDate.getMonth() != date.getMonth()) {
                break;
            }
        }
        currentDate.setDate(currentDate.getDate() + 1)
    }
    if (tableRow != null) {
        calendar.append(tableRow)
    }
}

$(document).ready(function() {
    today = new Date()
    today.setMonth(8)
    renderMonth(today)
})