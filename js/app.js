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

    Date.prototype.getPrettyFullDate = function() {
        return [this.getPrettyDate(), this.getFullYear()].join(' ')
    }

    Date.prototype.getHyphenSeparatedDate = function() {
        var year = this.getFullYear()
        var month = ('0' + (this.getMonth() + 1)).slice(-2)
        var day = ('0' + this.getDate()).slice(-2)
        return [year, month, day].join('-')
    }

    var App = function() {
        this.calendar = new Calendar(this, new Date())
        this.resultsbox = new ResultsBox(this)
        this.editbox = new EditBox(this)

        this.run = function() {
            this.calendar.render()
            this.bindControlHandlers()
            this.editbox.bindButtonHandlers()
            this.resultsbox.bindSearchHandler()
            this.resultsbox.bindScrollHandler()
        }

        this.bindControlHandlers = function() {
            var that = this

            $('.datebox-button-prev').click(function(event) {
                that.calendar.date.setMonth(that.calendar.date.getMonth() - 1)
                that.editbox.hide()
                that.calendar.render()
            })

            $('.datebox-button-next').click(function(event) {
                that.calendar.date.setMonth(that.calendar.date.getMonth() + 1)
                that.editbox.hide()
                that.calendar.render()
            })


            $('.datebox-button-today').click(function(event) {
                that.calendar.date = new Date()
                that.editbox.hide()
                that.calendar.render()
            })

            $('.controlbox-button-new').click(function(event) {
                $('.fastbox').show()
                $('.fastbox-input').focus()
                $('.controlbox-button-new').attr('disabled', 'disabled')
            })

            $('.fastbox-button-create').click(function(event) {
                $('.fastbox').hide()
                $('.controlbox-button-new').attr('disabled', false)

                if (window.localStorage) {
                    var item, adapter

                    adapter = new LocalStorageAdapter()
                    item = Item.fromString($('.fastbox-input').val())
                    adapter.save(item)

                    $('.createbox-input').val('')
                    that.fastbox.render()
                }
            })

            $('.fastbox-button-close').click(function(event) {
                $('.fastbox').hide()
                $('.controlbox-button-new').attr('disabled', false)
            })
        }
    }

    var Item = function(date, title, participants, details) {
        this.date = date
        this.title = title
        this.participants = participants
        this.details = details
    }

    Item.fromString = function(str) {
        var monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
        var ary, date, title, day, month

        ary = str.split(',')
        title = $.trim(ary[1])

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

            key = item.date.getHyphenSeparatedDate()
            value = JSON.stringify({ 
                title: item.title, 
                participants: item.participants,
                details: item.details
            })
            localStorage.setItem(key, value)
        }

        this.load = function(date) {
            var key, value, jso

            key = date.getHyphenSeparatedDate()
            value = localStorage.getItem(key)
            try {
                json = JSON.parse(value)
                return new Item(date, json.title || '', json.participants || '', json.details || '')
            } catch (ex) {
                return null
            }
        }

        this.remove = function(date) {
            var key = date.getHyphenSeparatedDate()
            localStorage.removeItem(key)
        }
    }

    var Calendar = function(app, date) {
        this.app = app
        this.date = date
        this.adapter = new LocalStorageAdapter()

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

            $('.datebox-current-month').html([this.date.getMonthName(), this.date.getFullYear()].join(' '))
        }

        this.renderCell = function(date, isFirstRow) {
            var app, item, cellDate, cellParticipants, clickHandler

            app = this.app
            item = this.adapter.load(date)
            cellDate = isFirstRow ? [date.getDayName(), date.getDate()].join(', ') : date.getDate()

            clickHandler = function(event) {
                $('.cell-current').removeClass('cell-current')
                $(this).addClass('cell-current')
                app.editbox.show(this)
            }

            return $('<td></td>')
                .addClass('cell')
                .addClass(item ? 'cell-reminder' : '')
                .addClass(date.getHyphenSeparatedDate() == new Date().getHyphenSeparatedDate() ? 'cell-today' : '')
                .append($('<div></div>')
                    .addClass('cell-wrapper')
                    .append($('<div></div>')
                        .addClass('cell-date')
                        .html(cellDate))
                    .append($('<div></div>')
                        .addClass('cell-title')
                        .html(item ? item.title : ''))
                    .append($('<div></div>')
                        .addClass('cell-participants')
                        .html(item ? item.participants : '')))
                .data('date', date.getHyphenSeparatedDate())
                .click(clickHandler)
        }
    }

    var ResultsBox = function(app) {
        this.app = app

        this.bindSearchHandler = function() {
            var that = this

            $('.searchbox').submit(function(event) {
                item.preventDefault()
            })

            $('.searchbox-input').keyup(function(event) {
                if (event.keyCode == 27) {
                    that.hide()
                } else {
                    that.show()
                    that.render()
                }
            })
        }

        this.hide = function() {
            $('.resultsbox-wrapper').hide()
            $('.resultsbox-hidden-scroll').scrollTop(0)
        }

        this.show = function() {
            $('.resultsbox-results').empty()
            $('.resultsbox-wrapper').show()
            $('.resultsbox-hidden-scroll').scrollTop(0)
        }

        this.render = function() {
            var items, key, value, adapter, substring, show

            items = $('.resultsbox-results')
            adapter = new LocalStorageAdapter()

            for(var i = 0; i < localStorage.length; i++) {
                key = localStorage.key(i)
                value = adapter.load(new Date(Date.parse(key)))
                substring = $('.searchbox-input').val().toLowerCase()
                show = value.date.getPrettyDate().toLowerCase().indexOf(substring) != -1
                    || value.title.toLowerCase().indexOf(substring) != -1
                    || value.participants.toLowerCase().indexOf(substring) != -1
                    || value.details.toLowerCase().indexOf(substring) != -1
                if (value && show) {
                    items.append(this.renderSearchItem(value))
                }
            }
        }

        this.renderSearchItem = function(item) {
            var app = this.app

            return $('<li></li>')
                .addClass('resultsbox-result')
                .append($('<div></div>')
                    .addClass('resultsbox-result-title')
                    .html(item.title))
                .append($('<div></div>')
                    .addClass('resultsbox-result-date')
                    .html(item.date.getPrettyDate()))
                .click(function(event) {
                    app.calendar.date = item.date
                    app.calendar.render()
                })
        }

        this.bindScrollHandler = function() {
            var divHeight, ulHeight, mouseScrolling
            var contentPosition, scrollPosition, savedScrollPosition, startPosition
            var $hiddenScroll, $customScroll, $resultsbox, $searchResults, $resultsboxWrapper

            $hiddenScroll = $('.resultsbox-hidden-scroll')
            $customScroll = $('.resultsbox-custom-scroll')
            $resultsboxWrapper = $('.resultsbox-wrapper')
            $resultsbox= $('.resultsbox')
            $searchResults = $('.resultsbox-results')
            mouseScrolling = false
            savedScrollPosition = 0

            var updateCustomScrollPosition = function(event) {
                divHeight = $resultsbox.height() - $customScroll.outerHeight(true)
                ulHeight = $hiddenScroll.get(0).scrollHeight - $hiddenScroll.height()
                contentPosition = $hiddenScroll.scrollTop() / ulHeight
                scrollPosition = contentPosition * divHeight
                
                $customScroll.css('top', scrollPosition + 'px')
                if (!mouseScrolling) {
                    savedScrollPosition = scrollPosition
                }
            }

            var updateHiddenScrollPosition = function(event) {
                startPosition = event.clientY
                divHeight = $resultsbox.height() - $customScroll.outerHeight(true)
                ulHeight = $hiddenScroll.get(0).scrollHeight - $hiddenScroll.height()
                mouseScrolling = true

                $(document).bind('mousemove', function(event) {
                    scrollPosition = (event.clientY - startPosition) + savedScrollPosition
                    contentPosition = scrollPosition / divHeight
                    $hiddenScroll.scrollTop(ulHeight * contentPosition)
                })

                $(document).bind('mouseup', function(event) {
                    savedScrollPosition = $hiddenScroll.scrollTop() / ulHeight * divHeight
                    $(document).unbind('mousemove')
                    mouseScrolling = false
                })
            }

            var preventScroll = function(event) {
                this.scrollTop = 0
                this.scrollLeft = 0
            }

            $hiddenScroll.bind('scroll', updateCustomScrollPosition)
            $customScroll.bind('mousedown', updateHiddenScrollPosition)
            $searchResults.bind('scroll', preventScroll)
            $resultsboxWrapper.bind('selectstart', function() {
                return false
            })
        }
    }

    var EditBox = function(app) {
        this.app = app
        this.adapter = new LocalStorageAdapter()

        this.show = function(cell) {
            var item, $editbox, $cell

            this.clear()
            $cell = $(cell)
            $('.editbox')
                .show()
                .css('left', $cell.offset().left + $cell.width() + 15)
                .css('top', $cell.offset().top - 20)

            this.date = new Date(Date.parse($cell.data('date')))
            $('.editbox-input-date').val(this.date.getPrettyFullDate())
            item = this.adapter.load(this.date)
            if (item) {
                $('.editbox-input-title').val(item.title)
                $('.editbox-input-participants').val(item.participants)
                $('.editbox-input-details').val(item.details)
            }
        }

        this.clear = function() {
            $('.editbox-input-title').val('')
            $('.editbox-input-date').val('')
            $('.editbox-input-participants').val('')
            $('.editbox-input-details').val('')
        }

        this.hide = function() {
            $('.cell-current').removeClass('cell-current')
            $('.editbox').hide()
            this.clear()
        }

        this.update = function() {
            var title, participants, details

            title = $('.editbox-input-title').val()
            participants = $('.editbox-input-participants').val()
            details =$('.editbox-input-details').val()
            this.adapter.save(new Item(this.date, title, participants, details))

            this.hide()
            this.app.calendar.render()
        }

        this.remove = function() {
            this.adapter.remove(this.date)
            this.hide()
            this.app.calendar.render()
        }

        this.bindButtonHandlers = function() {
            var that = this

            $('.editbox-button-close').click(function(event) {
                that.hide()
            })

            $('.editbox-button-done').click(function(event) {
                that.update()
            })

            $('.editbox-button-remove').click(function(event) {
                that.remove()
            })
        }
    }

    $(document).ready(function() {
        var app = new App()
        app.run()
    })
})()