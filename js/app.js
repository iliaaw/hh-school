(function() {
    Date.prototype.getDayName = function() {
        var dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
        return dayNames[this.getDay()]
    }

    Date.prototype.getMonthName = function() {
        var monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
        return monthNames[this.getMonth()]
    }

    Date.prototype.getRussianDay = function() {
        return this.getDay() == 0 ? 6 : this.getDay() - 1
    }

    Date.prototype.getPrettyDate = function() {
        var monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
        return [this.getDate(), monthNames[this.getMonth()]].join(' ')
    }

    Date.prototype.getFormattedDate = function() {
        var year = this.getFullYear()
        var month = ('0' + (this.getMonth() + 1)).slice(-2)
        var day = ('0' + this.getDate()).slice(-2)
        return [year, month, day].join('-')
    }

    var App = function() {
        this.calendar = new Calendar(new Date())
        this.searchbox = new SearchBox(this)

        this.run = function() {
            this.calendar.render()
            this.bindControlHandlers()
            this.searchbox.bindSearchHandler()
        }

        this.bindControlHandlers = function() {
            var that = this

            $('.button-left').click(function(event) {
                that.calendar.date.setMonth(that.calendar.date.getMonth() - 1)
                that.calendar.render()
            })

            $('.button-right').click(function(event) {
                that.calendar.date.setMonth(that.calendar.date.getMonth() + 1)
                that.calendar.render()
            })


            $('.button-today').click(function(event) {
                that.calendar.date = new Date()
                that.calendar.render()
            })

            $('.button-new').click(function(event) {
                $('.create-box').show()
                $('.button-new').attr('disabled', 'disabled')
            })

            $('.button-create').click(function(event) {
                $('.create-box').hide()
                $('.button-new').attr('disabled', false)

                if (window.localStorage) {
                    var item, adapter

                    adapter = new LocalStorageAdapter()
                    item = Item.fromString($('.create-input').val())
                    adapter.save(item)

                    $('.create-input').val('')
                    that.calendar.render()
                }
            })

            $('.button-cancel-create').click(function(event) {
                $('.create-box').hide()
                $('.button-new').attr('disabled', false)
            })
        }
    }

    var Item = function(date, title, participants) {
        this.date = date
        this.title = title
        this.participants = participants
    }

    Item.fromString = function(str) {
        var monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
        var ary, date, title, day, month

        ary = str.split(',')
        title = ary[1]

        ary = ary[0].split(' ')
        day = parseInt(ary[0])
        month = ary[1]

        for (var i = 0; i < monthNames.length; i++) {
            if (month == monthNames[i]) {
                date = new Date()
                date.setMonth(i)
                date.setDate(day)
                return new Item(date, title)
            }
        }
    }

    var LocalStorageAdapter = function() {
        this.save = function(item) {
            var key, value

            key = item.date.getFormattedDate()
            value = JSON.stringify({ title: item.title, participants: item.participants })
            localStorage.setItem(key, value)
        }

        this.load = function(date) {
            var key, value, jso

            key = date.getFormattedDate()
            value = localStorage.getItem(key)
            if (value) {
                json = JSON.parse(value)
                return new Item(date, json.title || '', json.participants || '')
            } else {
                return null
            }
        }
    }

    var Calendar = function(date) {
        this.date = date

        this.render = function() {
            var firstDay = new Date(this.date.getFullYear(), this.date.getMonth(), 1)
            var day = firstDay.getRussianDay()
            var dateIterator = new Date(firstDay)
            dateIterator.setDate(dateIterator.getDate() - day)

            var isFirstRow = true
            var $tableRow = $('<tr></tr>')
            var $calendar = $('.calendar')
            $calendar.empty()

            while (true) {
                $tableRow.append(this.renderCell(dateIterator, isFirstRow))
                if ($tableRow.children('td').length == 7) {
                    $calendar.append($tableRow)
                    $tableRow = $('<tr></tr>')
                    isFirstRow = false
                    if (dateIterator.getMonth() != this.date.getMonth()) {
                        break
                    }
                }
                dateIterator.setDate(dateIterator.getDate() + 1)
            }
            if ($tableRow.children('td').length != 0) {
                $calendar.append($tableRow)
            }

            $('.current-month').html([this.date.getMonthName(), this.date.getFullYear()].join(' '))
        }

        this.renderCell = function(date, isFirstRow) {
            var adapter, item, cellDate, cellTitle

            adapter = new LocalStorageAdapter()
            item = adapter.load(date)

            cellDate = isFirstRow ? [date.getDayName(), date.getDate()].join(', ') : date.getDate()
            cellTitle = item ? item.title : ''

            return $('<td></td>')
                .addClass(item ? 'reminder' : '')
                .append($('<span></span>')
                    .addClass('cell-title')
                    .html(cellDate))
                .append($('<div></div>')
                    .addClass('cell-body')
                    .html(cellTitle))
                .data('date', date.getFormattedDate())
        }
    }

    var SearchBox = function(app) {
        this.app = app

        this.bindSearchHandler = function() {
            var that = this

            $('.search-form').submit(function(event) {
                item.preventDefault()
            })

            $('.search-input').keyup(function(event) {
                if (event.keyCode == 27) {
                    that.hide()
                } else {
                    that.show()
                    that.render()
                }
            })
        }

        this.hide = function() {
            $('.search-wrapper').hide()
            $('.hidden-scrollbar').scrollTop(0)
        }

        this.show = function() {
            $('.search-items').empty()
            $('.search-wrapper').show()
            $('.hidden-scrollbar').scrollTop(0)
        }

        this.render = function() {
            var items, key, value, adapter, substring, show

            items = $('.search-items')
            adapter = new LocalStorageAdapter()

            for(var i = 0; i < localStorage.length; i++) {
                key = localStorage.key(i)
                value = adapter.load(new Date(Date.parse(key)))
                substring = $('.search-input').val().toLowerCase()
                show = value.date.getPrettyDate().toLowerCase().indexOf(substring) != -1
                    || value.title.toLowerCase().indexOf(substring) != -1
                    || value.participants.toLowerCase().indexOf(substring) != -1
                if (value && show) {
                    items.append(this.renderSearchItem(value))
                }
            }
        }

        this.renderSearchItem = function(item) {
            var app = this.app

            return $('<li></li>')
                .addClass('search-item')
                .append($('<div></div>')
                    .addClass('search-item-title')
                    .html(item.title))
                .append($('<div></div>')
                    .addClass('search-item-date')
                    .html(item.date.getPrettyDate()))
                .data('date', item.date.getFormattedDate())
                .click(function(event) {
                    app.calendar.date = item.date
                    app.calendar.render()
                })
        }

        this.bindScrollBar = function() {
            var divHeight, ulHeight, mouseScrolling
            var contentPosition, scrollPosition, savedScrollPosition, startPosition
            var $hiddenScroll, $customScroll, $search, $searchItems, $searchWrapper

            $hiddenScroll = $('.hidden-scrollbar')
            $customScroll = $('.custom-scrollbar')
            $searchWrapper = $('.search-wrapper')
            $search = $('.search')
            $searchItems = $('.search-items')
            mouseScrolling = false
            savedScrollPosition = 0

            var updateCustomScrollPosition = function() {
                divHeight = $search.height() - $customScroll.outerHeight(true)
                ulHeight = $hiddenScroll.get(0).scrollHeight - $hiddenScroll.height()
                contentPosition = $hiddenScroll.scrollTop() / ulHeight
                scrollPosition = contentPosition * divHeight
                
                $customScroll.css('top', scrollPosition + 'px')
                if (!mouseScrolling) {
                    savedScrollPosition = scrollPosition
                }
            }

            var updateHiddenScrollPosition = function() {
                startPosition = item.clientY
                divHeight = search.height() - customScroll.outerHeight(true)
                ulHeight = hiddenScroll.get(0).scrollHeight - hiddenScroll.height()
                mouseScrolling = true

                $(document).bind('mousemove', function(event) {
                    scrollPosition = (item.clientY - startPosition) + savedScrollPosition
                    contentPosition = scrollPosition / divHeight
                    hiddenScroll.scrollTop(ulHeight * contentPosition)
                })

                $(document).bind('mouseup', function(event) {
                    savedScrollPosition = hiddenScroll.scrollTop() / ulHeight * divHeight
                    $(document).unbind('mousemove', mousemove)
                    mouseScrolling = false
                })
            }

            var preventScroll = function() {
                this.scrollTop = 0
                this.scrollLeft = 0
            }

            $hiddenScroll.bind('scroll', updateCustomScrollPosition)
            $customScroll.bind('mousedown', updateHiddenScrollPosition)
            $searchItems.bind('scroll', preventScroll)
            $searchWrapper.bind('selectstart', function() {
                return false
            })
        }
    }

    $(document).ready(function() {
        var app = new App()
        app.run()
    })
})()