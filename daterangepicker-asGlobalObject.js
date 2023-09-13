//     This works like this:
//
//     stulipan.daterangepicker('#config-demo', customConfig);

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['moment'], function (moment) {
            return (root.returnExportsGlobal = factory(moment));
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('moment'));
    } else {
        // Browser globals
        root.returnExportsGlobal = factory(root.moment);
    }
}(typeof self !== 'undefined' ? self : this, function (moment) {
    // Use b in some fashion. b is now moment

    const stulipan = {};
    stulipan.daterangepicker = function(element, options, cb)
    {
        const DRP_TEMPLATE_ORIG =  ""
            // '<div class="daterangepicker" tabindex="-1" aria-labelledby="dateRangePickerLabel" role="dialog">' +
            // ' <div class="drp-body" id="dateRangePickerLabel" role="document">' +
            // '   <div class="drp-ranges-wrapper">' +
            // '     <div class="drp-ranges">' +
            // '     </div>' +
            // '   </div>' +
            // '   <div class="drp-calendars-wrapper">' +
            // '    <div class="drp-calendars drp-row">' +
            // '     <div class="drp-col drp-calendar left">' +
            // '      <div class="calendar-table"></div>' +
            // '      <div class="calendar-time"></div>' +
            // '     </div>' +
            // '     <div class="drp-col drp-calendar right">' +
            // '      <div class="calendar-table"></div>' +
            // '      <div class="calendar-time"></div>' +
            // '     </div>' +
            // '    </div>' +
            // '    <div class="drp-footer">' +
            // '      <div class="drp-selected"></div>' +
            // '      <div class="drp-buttons">' +
            // '       <div class="drp-row">' +
            // '        <div class="drp-col">' +
            // '         <button class="drp-cancel-btn btn btn-secondary" type="button"></button>' +
            // '        </div>' +
            // '        <div class="drp-col">' +
            // '         <button class="drp-apply-btn btn btn-primary" disabled="disabled" type="button"></button>' +
            // '        </div>' +
            // '       </div>' +
            // '      </div>' +
            // '    </div>' +
            // '   </div>' +
            // ' </div>' +
            // '</div>'
        ;
        const DRP_TEMPLATE = `
                <div class="daterangepicker" tabindex="-1" aria-labelledby="dateRangePickerLabel" role="dialog">
                    <div class="drp-body" id="dateRangePickerLabel" role="document">
                        <div class="drp-ranges-wrapper">
                            <div class="drp-ranges">
                            </div>
                        </div>
                        <div class="drp-calendars-wrapper">
                            <div class="drp-calendars drp-row">
                                <div class="drp-col drp-calendar left">
                                    <div class="calendar-table"></div>
                                    <div class="calendar-time"></div>
                                </div>
                                <div class="drp-col drp-calendar right">
                                    <div class="calendar-table"></div>
                                    <div class="calendar-time"></div>
                                </div>
                            </div>
                            <div class="drp-footer">
                                <div class="drp-selected"></div>
                                <div class="drp-buttons">
                                    <div class="drp-row">
                                        <div class="drp-col">
                                            <button class="drp-cancel-btn btn btn-secondary" type="button"></button>
                                        </div>
                                        <div class="drp-col">
                                            <button class="drp-apply-btn btn btn-primary" disabled="disabled" type="button"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

        this.init = function (element, options, cb) {
            // default settings for options
            this.parentEl = document.body; //'body';
            this.backdrop = ""; // Added by Stulipan
            this.element = document.querySelector(element);
            this.startDate = moment().startOf('day');
            this.endDate = moment().endOf('day');
            this.minDate = false;
            this.maxDate = false;
            this.maxSpan = false;
            this.autoApply = false;
            this.singleDatePicker = false;
            this.showDropdowns = false;
            this.minYear = moment().subtract(100, 'year').format('YYYY');
            this.maxYear = moment().add(100, 'year').format('YYYY');
            this.showWeekNumbers = false;
            this.showISOWeekNumbers = false;
            this.showCustomRangeLabel = false; // true;
            this.timePicker = false;
            this.timePicker24Hour = false;
            this.timePickerIncrement = 1;
            this.timePickerSeconds = false;
            this.linkedCalendars = true;
            this.autoUpdateInput = true;
            this.alwaysShowCalendars = false;
            this.ranges = {};

            this.opens = 'right';
            if (this.element.classList.contains('pull-right'))
                this.opens = 'left';

            this.drops = 'down';
            if (this.element.classList.contains('dropup'))
                this.drops = 'up';

            this.buttonClasses = 'btn';
            this.applyButtonClasses = 'btn-primary';
            this.cancelButtonClasses = 'btn-secondary';

            this.locale = {
                direction: 'ltr',
                // format: moment.localeData().longDateFormat('L'),
                format: "YYYY/MM/DD",
                separator: ' - ',
                applyLabel: 'Apply',
                cancelLabel: 'Cancel',
                weekLabel: 'W',
                customRangeLabel: 'Custom Range',
                dropdownRangeLabel: 'Date range', // Added by Stulipan
                daysOfWeek: moment.weekdaysMin(),
                monthNames: moment.monthsShort(),
                firstDay: moment.localeData().firstDayOfWeek()
            };

            this.callback = function() { };

            // some state information
            this.isShowing = false;
            this.leftCalendar = {};
            this.rightCalendar = {};

            // Added by Stulipan
            // JavaScript equivalent for jQuery formatted selector to search for focusable items
            this._focusableItemsString = "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex='0'], *[contenteditable]";
            // Added by Stulipan
            // store the item that has focus before opening the modal window
            this._focusedItemBeforeModal = '';

            this.template = undefined;
            if (typeof this.template !== 'string' && !(this.template instanceof Element)) {
                this.template = document.createElement('div');
                this.template.innerHTML = DRP_TEMPLATE;
                this.template = this.template.firstElementChild;
            }

            // if (typeof options.template !== 'string' && !(options.template instanceof Element)) {
            //     options.template = document.createElement('div');
            //     options.template.innerHTML = DRP_TEMPLATE;
            //     options.template = options.template.firstElementChild;
            // }

            if (options.parentEl && document.querySelector(options.parentEl)) {
                this.parentEl = document.querySelector(options.parentEl);
            }
            this.container = this.parentEl.appendChild(this.template);   //// ?????? ujra meg ujra appendChild?


            // Handle all the possible options overriding defaults
            if (typeof options.locale === 'object') {
                if (typeof options.locale.direction === 'string') {
                    this.locale.direction = options.locale.direction;
                }

                if (typeof options.locale.format === 'string') {
                    this.locale.format = options.locale.format;
                }

                if (typeof options.locale.separator === 'string') {
                    this.locale.separator = options.locale.separator;
                }

                if (Array.isArray(options.locale.daysOfWeek)) {
                    this.locale.daysOfWeek = options.locale.daysOfWeek.slice();
                }

                if (Array.isArray(options.locale.monthNames)) {
                    this.locale.monthNames = options.locale.monthNames.slice();
                }

                if (typeof options.locale.firstDay === 'number') {
                    this.locale.firstDay = options.locale.firstDay;
                }

                if (typeof options.locale.applyLabel === 'string') {
                    this.locale.applyLabel = options.locale.applyLabel;
                }

                if (typeof options.locale.cancelLabel === 'string') {
                    this.locale.cancelLabel = options.locale.cancelLabel;
                }

                if (typeof options.locale.weekLabel === 'string') {
                    this.locale.weekLabel = options.locale.weekLabel;
                }

                if (typeof options.locale.customRangeLabel === 'string') {
                    // Support unicode chars in the custom range name.
                    var elem = document.createElement('textarea');
                    elem.innerHTML = options.locale.customRangeLabel;
                    var rangeHtml = elem.value;
                    this.locale.customRangeLabel = rangeHtml;
                }

                if (typeof options.locale.dropdownRangeLabel === 'string') {
                    this.locale.dropdownRangeLabel = options.locale.dropdownRangeLabel;
                }
            }

            this.container.classList.add(this.locale.direction);

            if (typeof options.startDate === 'string') {
                this.startDate = moment(options.startDate, this.locale.format);
            }

            if (typeof options.endDate === 'string') {
                this.endDate = moment(options.endDate, this.locale.format);
            }

            if (typeof options.minDate === 'string') {
                this.minDate = moment(options.minDate, this.locale.format);
            }

            if (typeof options.maxDate === 'string') {
                this.maxDate = moment(options.maxDate, this.locale.format);
            }

            if (typeof options.startDate === 'object') {
                this.startDate = moment(options.startDate);
            }

            if (typeof options.endDate === 'object') {
                this.endDate = moment(options.endDate);
            }

            if (typeof options.minDate === 'object') {
                this.minDate = moment(options.minDate);
            }

            if (typeof options.maxDate === 'object') {
                this.maxDate = moment(options.maxDate);
            }

            // Sanity check for bad options
            if (this.minDate && this.startDate.isBefore(this.minDate)) {
                this.startDate = this.minDate.clone();
            }

            // Sanity check for bad options
            if (this.maxDate && this.endDate.isAfter(this.maxDate)) {
                this.endDate = this.maxDate.clone();
            }

            if (typeof options.applyButtonClasses === 'string') {
                this.applyButtonClasses = options.applyButtonClasses;
            }

            if (typeof options.applyClass === 'string') {
                // Backwards compat
                this.applyButtonClasses = options.applyClass;
            }

            if (typeof options.cancelButtonClasses === 'string') {
                this.cancelButtonClasses = options.cancelButtonClasses;
            }

            if (typeof options.cancelClass === 'string') {
                // Backwards compat
                this.cancelButtonClasses = options.cancelClass;
            }

            if (typeof options.maxSpan === 'object') {
                this.maxSpan = options.maxSpan;
            }

            if (typeof options.dateLimit === 'object') {
                // Backwards compat
                this.maxSpan = options.dateLimit;
            }

            if (typeof options.opens === 'string') {
                this.opens = options.opens;
            }

            if (typeof options.drops === 'string') {
                this.drops = options.drops;
            }

            if (typeof options.showWeekNumbers === 'boolean') {
                this.showWeekNumbers = options.showWeekNumbers;
            }

            if (typeof options.showISOWeekNumbers === 'boolean') {
                this.showISOWeekNumbers = options.showISOWeekNumbers;
            }

            if (typeof options.buttonClasses === 'string') {
                this.buttonClasses = options.buttonClasses;
            }

            if (Array.isArray(options.buttonClasses)) {
                this.buttonClasses = options.buttonClasses.join(' ');
            }

            if (typeof options.showDropdowns === 'boolean') {
                this.showDropdowns = options.showDropdowns;
            }

            if (typeof options.minYear === 'number') {
                this.minYear = options.minYear;
            }

            if (typeof options.maxYear === 'number') {
                this.maxYear = options.maxYear;
            }

            if (typeof options.showCustomRangeLabel === 'boolean') {
                this.showCustomRangeLabel = options.showCustomRangeLabel;
            }

            // Added by Stulipan
            if (typeof options.showRangesAsDropdown === 'boolean') {
                this.showRangesAsDropdown = options.showRangesAsDropdown;
            }

            // Added by Stulipan
            if (typeof options.displayInline === 'boolean') {
                this.displayInline = options.displayInline;
            }

            // Added by Stulipan
            if (typeof options.displayInlineAlwaysOn === 'boolean') {
                this.displayInlineAlwaysOn = options.displayInlineAlwaysOn;
            }

            if (typeof options.singleDatePicker === 'boolean') {
                this.singleDatePicker = options.singleDatePicker;
                if (this.singleDatePicker) {
                    this.endDate = this.startDate.clone();
                }
            }

            if (typeof options.timePicker === 'boolean') {
                this.timePicker = options.timePicker;
            }

            if (typeof options.timePickerSeconds === 'boolean') {
                this.timePickerSeconds = options.timePickerSeconds;
            }

            if (typeof options.timePickerIncrement === 'number') {
                this.timePickerIncrement = options.timePickerIncrement;
            }

            if (typeof options.timePicker24Hour === 'boolean') {
                this.timePicker24Hour = options.timePicker24Hour;
            }

            if (typeof options.autoApply === 'boolean') {
                this.autoApply = options.autoApply;
            }

            if (typeof options.autoUpdateInput === 'boolean') {
                this.autoUpdateInput = options.autoUpdateInput;
            }

            if (typeof options.linkedCalendars === 'boolean') {
                this.linkedCalendars = options.linkedCalendars;
            }

            if (typeof options.isInvalidDate === 'function') {
                this.isInvalidDate = options.isInvalidDate;
            }

            if (typeof options.isCustomDate === 'function') {
                this.isCustomDate = options.isCustomDate;
            }

            if (typeof options.alwaysShowCalendars === 'boolean') {
                this.alwaysShowCalendars = options.alwaysShowCalendars;
            }

            // Update day names order to firstDay
            if (this.locale.firstDay !== 0) {
                var iterator = this.locale.firstDay;
                while (iterator > 0) {
                    this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                    iterator--;
                }
            }

            var start, end, range;

            // If no start/end dates set, check if an input element contains initial values
            if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
                if (this.element instanceof HTMLInputElement && this.element.type === 'text') {
                    var val = this.element.value;
                    var split = val.split(this.locale.separator);

                    start = end = null;

                    if (split.length === 2) {
                        start = moment(split[0], this.locale.format);
                        end = moment(split[1], this.locale.format);
                    } else if (this.singleDatePicker && val !== "") {
                        start = moment(val, this.locale.format);
                        end = moment(val, this.locale.format);
                    }
                    if (start !== null && end !== null) {
                        this.setStartDate(start);
                        this.setEndDate(end);
                    }
                }
            }

            // Added by Stulipan
            if (this.showRangesAsDropdown) {
                this.container.classList.add("show-ranges-dropdown");
            }
            if (this.displayInline) {
                this.container.classList.add("drp-inline");
            }
            if (!(this.parentEl instanceof HTMLBodyElement)) {
                this.container.classList.add("drp-parent");
            }

            if (typeof options.ranges === 'object') {
                for (range in options.ranges) {
                    if (typeof options.ranges[range][0] === 'string') {
                        start = moment(options.ranges[range][0], this.locale.format);
                    } else {
                        start = moment(options.ranges[range][0]);
                    }

                    if (typeof options.ranges[range][1] === 'string') {
                        end = moment(options.ranges[range][1], this.locale.format);
                    } else {
                        end = moment(options.ranges[range][1]);
                    }

                    // If the start or end date exceeds those allowed by the minDate or maxSpan options, shorten the range to the allowable period.
                    if (this.minDate && start.isBefore(this.minDate)) {
                        start = this.minDate.clone();
                    }

                    var maxDate = this.maxDate;
                    if (this.maxSpan && maxDate && start.clone().add(this.maxSpan).isAfter(maxDate)) {
                        maxDate = start.clone().add(this.maxSpan);
                    }
                    if (maxDate && end.isAfter(maxDate)) {
                        end = maxDate.clone();
                    }

                    // If the end of the range is before the minimum or the start of the range is after the maximum, don't display this range option at all.
                    if ((this.minDate && end.isBefore(this.minDate, this.timepicker ? 'minute' : 'day')) || (maxDate && start.isAfter(maxDate, this.timepicker ? 'minute' : 'day'))) {
                        continue;
                    }

                    // Support unicode chars in the range names.
                    var elem = document.createElement('textarea');
                    elem.innerHTML = range;
                    var rangeHtml = elem.value;

                    this.ranges[rangeHtml] = [start, end];
                }

                var list = '';
                if (this.showRangesAsDropdown) {
                    list = '<div class="drp-form-group">' +
                        '<label class="drp-label">' + this.locale.dropdownRangeLabel + '</label>' +
                        '<select id="custom_ranges" name="custom_ranges" class="rangeselect form-control">';
                    for (range in this.ranges) {
                        list += '<option value="' + range + '" data-range-key="' + range + '">' + range + '</option>';
                    }
                    if (this.showCustomRangeLabel) {
                        list += '<option value="' + this.locale.customRangeLabel + '" data-range-key="' + this.locale.customRangeLabel + '">' + this.locale.customRangeLabel + '</option>';
                    }
                    list += '</select>' +
                        '</div>';
                    this.container.querySelector(".drp-ranges").insertAdjacentHTML('afterbegin', list);
                } else {
                    list = '<ul>';
                    for (range in this.ranges) {
                        list += '<li data-range-key="' + range + '">' + range + '</li>';
                    }
                    if (this.showCustomRangeLabel) {
                        list += '<li data-range-key="' + this.locale.customRangeLabel + '">' + this.locale.customRangeLabel + '</li>';
                    }
                    list += '</ul>';
                    this.container.querySelector('.drp-ranges').insertAdjacentHTML('afterbegin', list);
                }
            }

            if (typeof cb === 'function') {
                this.callback = cb;
            }

            if (!this.timePicker) {
                this.startDate = this.startDate.startOf('day');
                this.endDate = this.endDate.endOf('day');
                this.container.querySelector('.calendar-time').style.display = 'none';
            }

            // Can't be used together for now
            if (this.timePicker && this.autoApply) {
                this.autoApply = false;
            }

            if (this.autoApply) {
                this.container.classList.add('auto-apply');
            }

            if (typeof options.ranges === 'object') {
                this.container.classList.add('show-ranges');
            }

            if (this.singleDatePicker) {
                this.container.classList.add('single');
                this.container.querySelector('.drp-calendar.left').classList.add('single');
                this.container.querySelector('.drp-calendar.left').style.display = 'block';
                this.container.querySelector('.drp-calendar.right').style.display = 'none';
                if (!this.timePicker && this.autoApply) {
                    this.container.classList.add('auto-apply');
                }
            }

            if ((typeof options.ranges === 'undefined' && !this.singleDatePicker) || this.alwaysShowCalendars) {
                this.container.classList.add('show-calendar');
            }

            this.container.classList.add('opens' + this.opens);

            // Apply CSS classes and labels to buttons
            var applyBtn = this.container.querySelector('.drp-apply-btn');
            var cancelBtn = this.container.querySelector('.drp-cancel-btn');
            applyBtn.classList.add(this.buttonClasses);
            cancelBtn.classList.add(this.buttonClasses);
            if (this.applyButtonClasses.length) {
                applyBtn.classList.add(this.applyButtonClasses);
            }
            if (this.cancelButtonClasses.length) {
                cancelBtn.classList.add(this.cancelButtonClasses);
            }
            applyBtn.innerHTML = this.locale.applyLabel;
            cancelBtn.innerHTML = this.locale.cancelLabel;






            // event listeners
            // this.container.querySelector('.drp-calendar.left')
            this.container.querySelector('.drp-calendars')
                .addEventListener('click', function (event) {

                    var element = event.target;
                    while (element !== null && element.tagName !== 'DIV') {
                        element = element.parentNode;
                    }

                    if (element.classList.contains('prev') && element.classList.contains('available')) {
                        this.clickPrev(event);
                    } else if (element.classList.contains('next') && element.classList.contains('available')) {
                        this.clickNext(event);
                    }
                }.bind(this));


            this.container.querySelector('.drp-calendars')
                .addEventListener('keydown', function (event) {

                    var element = event.target;
                    while (element !== null && element.tagName !== 'DIV') {
                        element = element.parentNode;
                    }

                    if (element.classList.contains('prev') && element.classList.contains('available')) {
                        this._keydownPrev(event);
                    } else if (element.classList.contains('next') && element.classList.contains('available')) {
                        this._keydownNext(event);
                    } else if (element.classList.contains('cell') && element.classList.contains('available')) {
                        this._navigateDate(event, element);
                    }
                }.bind(this));

            this.container.querySelector('.drp-calendars')
                .addEventListener('mousedown', function (event) {

                    var element = event.target;
                    while (element !== null && element.tagName !== 'DIV') {
                        element = element.parentNode;
                    }

                    if (element.classList.contains('cell') && element.classList.contains('available')) {
                        this.clickDate(event, element);
                    }
                }.bind(this));

            this.container.querySelector('.drp-calendars')
                .addEventListener('mouseenter', function (event) {

                    var element = event.target;
                    while (element !== null && element.tagName !== 'DIV') {
                        element = element.parentNode;
                    }

                    if (element.classList.contains('cell') && element.classList.contains('available')) {
                        this.hoverDate(event);
                    }
                }.bind(this));

            this.container.querySelector('.drp-calendar')
                .addEventListener('change', function (event) {
                    if (event.target.classList.contains('yearselect') || event.target.classList.contains('monthselect')) {
                        this.monthOrYearChanged(event);
                    }
                }.bind(this));

            this.container.querySelector('.drp-calendar')
                .addEventListener('change', function (event) {
                    if (
                        event.target.classList.contains('hourselect') ||
                        event.target.classList.contains('minuteselect') ||
                        event.target.classList.contains('secondselect') ||
                        event.target.classList.contains('ampmselect')
                    ) {
                        this.timeChanged(event);
                    }
                }.bind(this));

            this.container.querySelector('.drp-ranges')
                .addEventListener('click', function (event) {
                    if (event.target.tagName === 'LI') {
                        this.clickRange(event);
                    }
                }.bind(this));

            this.container.querySelector('.drp-ranges')
                .addEventListener('keydown', function (event) {
                    if (event.target.tagName === 'LI') {
                        this._navigateRange(event);
                    }
                }.bind(this));

            this.container.querySelector('.drp-ranges')
                .addEventListener('change', function (event) {
                    if (event.target.tagName === 'SELECT') {
                        this.clickRange(event);
                    }
                }.bind(this));

            this.container.querySelector('.drp-buttons')
                .addEventListener('click', function (event) {
                    if (event.target.classList.contains('drp-apply-btn')) {
                        this.clickApply(event);
                    } else if (event.target.classList.contains('drp-cancel-btn')) {
                        this.clickCancel(event);
                    }
                }.bind(this));

            if (this.element.tagName === 'INPUT' || this.element.tagName === 'BUTTON') {
                this.element.addEventListener('click', this.show.bind(this));
                this.element.addEventListener('keyup', this.elementChanged.bind(this));
                this.element.addEventListener('keydown', this._keydown.bind(this)); // IE 11 compatibility
            } else {
                this.element.addEventListener('click', this.toggle.bind(this));
                this.element.addEventListener('keydown', this._keydownToggle.bind(this));
            }

            //
            // if attached to a text input, set the initial value
            //
            this.updateElement();

            if (this.displayInlineAlwaysOn) {
                this.show(this.element);
            } else {
                // Add event listeners for trapping the Tab and Escape keys
                this.container.addEventListener('keydown', this._trapTabKey.bind(this));
                this.container.addEventListener('keydown', this._trapEscapeKey.bind(this));
            }

        };


        //==============================================================================================================
        // Define all your methods and properties here
        //==============================================================================================================

        this.setStartDate = function (startDate) {
            if (typeof startDate === 'string') {
                this.startDate = moment(startDate, this.locale.format);
            }

            if (typeof startDate === 'object') {
                this.startDate = moment(startDate);
            }

            if (!this.timePicker) {
                this.startDate = this.startDate.startOf('day');
            }

            if (this.timePicker && this.timePickerIncrement) {
                this.startDate.minute(
                    Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement
                );
            }

            if (this.minDate && this.startDate.isBefore(this.minDate)) {
                this.startDate = this.minDate.clone();
                if (this.timePicker && this.timePickerIncrement) {
                    this.startDate.minute(
                        Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement
                    );
                }
            }

            if (this.maxDate && this.startDate.isAfter(this.maxDate)) {
                this.startDate = this.maxDate.clone();
                if (this.timePicker && this.timePickerIncrement) {
                    this.startDate.minute(
                        Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement
                    );
                }
            }

            if (!this.isShowing) {
                this.updateElement();
            }

            this.updateMonthsInView();
        };

        this.setEndDate = function (endDate) {
            if (typeof endDate === 'string')
                this.endDate = moment(endDate, this.locale.format);

            if (typeof endDate === 'object')
                this.endDate = moment(endDate);

            if (!this.timePicker)
                this.endDate = this.endDate.endOf('day');

            if (this.timePicker && this.timePickerIncrement)
                this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

            if (this.endDate.isBefore(this.startDate))
                this.endDate = this.startDate.clone();

            if (this.maxDate && this.endDate.isAfter(this.maxDate))
                this.endDate = this.maxDate.clone();

            if (this.maxSpan && this.startDate.clone().add(this.maxSpan).isBefore(this.endDate))
                this.endDate = this.startDate.clone().add(this.maxSpan);

            this.previousRightTime = this.endDate.clone();

            var selectedElement = document.querySelector('.drp-selected');
            selectedElement.innerHTML = this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format);


            if (!this.isShowing)
                this.updateElement();

            this.updateMonthsInView();
        };

        this.isInvalidDate = function() {
            return false;
        };

        this.isCustomDate = function() {
            return false;
        };

        this.updateView = function () {
            if (this.timePicker) {
                this.renderTimePicker('left');
                this.renderTimePicker('right');

                var rightTimeSelect = this.container.querySelector('.right .calendar-time select');

                if (!this.endDate) {
                    rightTimeSelect.disabled = true;
                    rightTimeSelect.classList.add('disabled');
                } else {
                    rightTimeSelect.disabled = false;
                    rightTimeSelect.classList.remove('disabled');
                }
            }

            if (this.endDate) {
                var drpSelected = this.container.querySelector('.drp-selected');
                drpSelected.innerHTML = this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format);
            }

            this.updateMonthsInView();
            this.updateCalendars();
            this.updateFormInputs();
        };

        this.updateMonthsInView = function() {
            if (this.endDate) {

                //if both dates are visible already, do nothing
                if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                    (this.startDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.startDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                    &&
                    (this.endDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.endDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                ) {
                    return;
                }

                this.leftCalendar.month = this.startDate.clone().date(2);
                if (!this.linkedCalendars && (this.endDate.month() != this.startDate.month() || this.endDate.year() != this.startDate.year())) {
                    this.rightCalendar.month = this.endDate.clone().date(2);
                } else {
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }

            } else {
                if (this.leftCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM') && this.rightCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM')) {
                    this.leftCalendar.month = this.startDate.clone().date(2);
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }
            }
            if (this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate) {
                this.rightCalendar.month = this.maxDate.clone().date(2);
                this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, 'month');
            }
        };

        this.updateCalendars = function() {
            if (this.timePicker) {
                let hour, minute, second;
                const leftCalendarHourSelect = this.container.querySelector('.left .hourselect');
                const leftCalendarMinuteSelect = this.container.querySelector('.left .minuteselect');
                const rightCalendarHourSelect = this.container.querySelector('.right .hourselect');
                const rightCalendarMinuteSelect = this.container.querySelector('.right .minuteselect');

                if (this.endDate) {
                    hour = parseInt(leftCalendarHourSelect.value, 10);
                    minute = parseInt(leftCalendarMinuteSelect.value, 10);
                    if (isNaN(minute)) {
                        minute = parseInt(leftCalendarMinuteSelect.options[leftCalendarMinuteSelect.options.length - 1].value, 10);
                    }
                    second = this.timePickerSeconds ? parseInt(this.container.querySelector('.left .secondselect').value, 10) : 0;
                    if (!this.timePicker24Hour) {
                        const ampm = this.container.querySelector('.left .ampmselect').value;
                        if (ampm === 'PM' && hour < 12) {
                            hour += 12;
                        }
                        if (ampm === 'AM' && hour === 12) {
                            hour = 0;
                        }
                    }
                } else {
                    hour = parseInt(rightCalendarHourSelect.value, 10);
                    minute = parseInt(rightCalendarMinuteSelect.value, 10);
                    if (isNaN(minute)) {
                        minute = parseInt(rightCalendarMinuteSelect.options[rightCalendarMinuteSelect.options.length - 1].value, 10);
                    }
                    second = this.timePickerSeconds ? parseInt(this.container.querySelector('.right .secondselect').value, 10) : 0;
                    if (!this.timePicker24Hour) {
                        const ampm = this.container.querySelector('.right .ampmselect').value;
                        if (ampm === 'PM' && hour < 12) {
                            hour += 12;
                        }
                        if (ampm === 'AM' && hour === 12) {
                            hour = 0;
                        }
                    }
                }

                this.leftCalendar.month.hour(hour).minute(minute).second(second);
                this.rightCalendar.month.hour(hour).minute(minute).second(second);
            }

            this.renderCalendar('left');
            this.renderCalendar('right');

            // Highlight any predefined range matching the current start and end dates
            if (this.showRangesAsDropdown) {
                this.container.querySelectorAll('.drp-ranges option').forEach(option => {
                    option.selected = false;
                });
            } else {
                this.container.querySelectorAll('.drp-ranges li').forEach(li => {
                    li.classList.remove('active');
                });
            }

            // If there's no start date in the current calendar view and thus no '.cell[tabindex=0]'
            if (!this.container.querySelector('.cell[tabindex="0"]')) {
                if (this.singleDatePicker) {
                    // Make the first cell focusable
                    const firstAvailableCell = this.container.querySelector('.cell.available:not(.off)');
                    if (firstAvailableCell) {
                        firstAvailableCell.tabIndex = 0;
                    }
                } else {
                    // Make the first cell focusable in the right table
                    const firstAvailableCellRight = this.container.querySelector('.drp-calendar.right .cell.available:not(.off)');
                    if (firstAvailableCellRight) {
                        firstAvailableCellRight.tabIndex = 0;
                    }
                }
            }

            this._hideEmptyRow('left');
            this._hideEmptyRow('right');

            if (this.endDate == null) {
                return;
            }

            this.calculateChosenLabel();
        };

        this._hideEmptyRow = function(side) {
            let isFirstRowEmpty = true;
            const calendarSide = this.container.querySelector(`.drp-calendar.${side}`);
            const firstWeekRow = calendarSide.querySelector('.week-row:first-of-type');
            const firstWeekCells = firstWeekRow.querySelectorAll('.cell:not(.week)');

            firstWeekCells.forEach(function (cell) {
                if (!cell.classList.contains('off')) {
                    isFirstRowEmpty = false;
                }
            });

            // Hide first row if empty
            if (isFirstRowEmpty) {
                firstWeekRow.style.display = 'none';
            }

            let isLastRowEmpty = true;
            const lastWeekRow = calendarSide.querySelector('.week-row:last-of-type');
            const lastWeekCells = lastWeekRow.querySelectorAll('.cell:not(.week)');

            lastWeekCells.forEach(function (cell) {
                if (!cell.classList.contains('off')) {
                    isLastRowEmpty = false;
                }
            });

            // Hide last row if empty
            if (isLastRowEmpty) {
                lastWeekRow.style.display = 'none';
                // This was used to hide only the '.week' cell
                // lastWeekRow.querySelector('.cell.week').classList.add('off', 'ends');
            }
        };

        this.renderCalendar = function(side) {
            // Build the matrix of dates that will populate the calendar

            var calendar = side === 'left' ? this.leftCalendar : this.rightCalendar;
            var month = calendar.month.month();
            var year = calendar.month.year();
            var hour = calendar.month.hour();
            var minute = calendar.month.minute();
            var second = calendar.month.second();
            var daysInMonth = moment([year, month]).daysInMonth();
            var firstDay = moment([year, month, 1]);
            var lastDay = moment([year, month, daysInMonth]);
            var lastMonth = moment(firstDay).subtract(1, 'month').month();
            var lastYear = moment(firstDay).subtract(1, 'month').year();
            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
            var dayOfWeek = firstDay.day();

            // Initialize a 6 rows x 7 columns array for the calendar
            var calendarArray = [];
            calendarArray.firstDay = firstDay;
            calendarArray.lastDay = lastDay;

            for (var i = 0; i < 6; i++) {
                calendarArray[i] = [];
            }

            // Populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek === this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);

            var col, row;
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendarArray[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
                curDate.hour(12);

                if (this.minDate && calendarArray[row][col].format('YYYY-MM-DD') === this.minDate.format('YYYY-MM-DD') && calendarArray[row][col].isBefore(this.minDate) && side === 'left') {
                    calendarArray[row][col] = this.minDate.clone();
                }

                if (this.maxDate && calendarArray[row][col].format('YYYY-MM-DD') === this.maxDate.format('YYYY-MM-DD') && calendarArray[row][col].isAfter(this.maxDate) && side === 'right') {
                    calendarArray[row][col] = this.maxDate.clone();
                }
            }

            // Make the calendar object available to hoverDate/clickDate
            if (side === 'left') {
                this.leftCalendar.calendar = calendarArray;
            } else {
                this.rightCalendar.calendar = calendarArray;
            }

            // Display the calendar

            var minDate = side === 'left' ? this.minDate : this.startDate;
            var maxDate = this.maxDate;
            var selected = side === 'left' ? this.startDate : this.endDate;
            var arrow = this.locale.direction === 'ltr' ? { left: 'chevron-left', right: 'chevron-right' } : { left: 'chevron-right', right: 'chevron-left' };

            var html = '<div class="calendar-header">';

            if ((!minDate || minDate.isBefore(calendarArray.firstDay)) && (!this.linkedCalendars || side === 'left')) {
                html += '<div class="prev available" tabindex="0"><span></span></div>';
            } else {
                html += '<div class="prev"></div>';
            }

            var dateHtml = this.locale.monthNames[calendarArray[1][1].month()] + calendarArray[1][1].format(" YYYY");

            if (this.showDropdowns) {
                var currentMonth = calendarArray[1][1].month();
                var currentYear = calendarArray[1][1].year();
                var maxYear = (maxDate && maxDate.year()) || (this.maxYear);
                var minYear = (minDate && minDate.year()) || (this.minYear);
                var inMinYear = currentYear == minYear;
                var inMaxYear = currentYear == maxYear;

                var monthHtml = '<select class="monthselect form-control form-control-sm">';
                for (var m = 0; m < 12; m++) {
                    if ((!inMinYear || (minDate && m >= minDate.month())) && (!inMaxYear || (maxDate && m <= maxDate.month()))) {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            ">" + this.locale.monthNames[m] + "</option>";
                    } else {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            " disabled='disabled'>" + this.locale.monthNames[m] + "</option>";
                    }
                }
                monthHtml += "</select>";

                var yearHtml = '<select class="yearselect form-control form-control-sm">';
                for (var y = minYear; y <= maxYear; y++) {
                    yearHtml += '<option value="' + y + '"' +
                        (y === currentYear ? ' selected="selected"' : '') +
                        '>' + y + '</option>';
                }
                yearHtml += '</select>';

                dateHtml = monthHtml + yearHtml;
            }

            html += '<div class="month">' + dateHtml + '</div>';
            if ((!maxDate || maxDate.isAfter(calendarArray.lastDay)) && (!this.linkedCalendars || side === 'right' || this.singleDatePicker)) {
                html += '<div class="next available" tabindex="0"><span></span></div>';
            } else {
                html += '<div class="next"></div>';
            }

            html += '</div>';
            html += '<div class="calendar-body" role="grid">'
            html += '<div class="weekdays" role="row">';

            // Add week number label
            if (this.showWeekNumbers || this.showISOWeekNumbers)
                html += '<div class="week cell">' + this.locale.weekLabel + '</div>';

            this.locale.daysOfWeek.forEach(function (dayOfWeek, index) {
                html += '<div class="cell">' + dayOfWeek + '</div>';
            });

            html += '</div>';
            html += '<div class="days">';

            // Adjust maxDate to reflect the maxSpan setting to grey out end dates beyond the maxSpan
            if (this.endDate === null && this.maxSpan) {
                var maxLimit = this.startDate.clone().add(this.maxSpan).endOf('day');
                if (!maxDate || maxLimit.isBefore(maxDate)) {
                    maxDate = maxLimit;
                }
            }

            for (var row = 0; row < 6; row++) {
                html += '<div class="week-row" role="row">';

                // Add week number
                if (this.showWeekNumbers)
                    html += '<div class="cell week" role="gridcell button">' + calendarArray[row][0].week() + '</div>';
                else if (this.showISOWeekNumbers)
                    html += '<div class="cell week" role="gridcell button">' + calendarArray[row][0].isoWeek() + '</div>';

                for (var col = 0; col < 7; col++) {
                    var classes = [];

                    // Highlight today's date
                    if (calendarArray[row][col].isSame(new Date(), "day"))
                        classes.push('today');

                    // Highlight weekends
                    if (calendarArray[row][col].isoWeekday() > 5)
                        classes.push('weekend');

                    // Grey out the dates in other months displayed at the beginning and end of this calendar
                    if (calendarArray[row][col].month() !== calendarArray[1][1].month())
                        classes.push('off', 'ends');

                    // Don't allow selection of dates before the minimum date
                    if (this.minDate && calendarArray[row][col].isBefore(this.minDate, 'day'))
                        classes.push('off', 'disabled');

                    // Don't allow selection of dates after the maximum date
                    if (maxDate && calendarArray[row][col].isAfter(maxDate, 'day'))
                        classes.push('off', 'disabled');

                    // Don't allow selection of date if a custom function decides it's invalid
                    if (this.isInvalidDate(calendarArray[row][col]))
                        classes.push('off', 'disabled');

                    // Highlight the currently selected start date
                    if (calendarArray[row][col].format('YYYY-MM-DD') === this.startDate.format('YYYY-MM-DD'))
                        classes.push('active', 'start-date', 'in-range');

                    // Highlight the currently selected end date
                    if (this.endDate !== null && calendarArray[row][col].format('YYYY-MM-DD') === this.endDate.format('YYYY-MM-DD'))
                        classes.push('active', 'end-date', 'in-range');

                    // Highlight dates in-between the selected dates
                    if (this.endDate !== null && calendarArray[row][col] > this.startDate && calendarArray[row][col] < this.endDate)
                        classes.push('in-range');

                    // Apply custom classes for this date
                    var isCustom = this.isCustomDate(calendarArray[row][col]);
                    if (isCustom !== false) {
                        if (typeof isCustom === 'string')
                            classes.push(isCustom);
                        else
                            Array.prototype.push.apply(classes, isCustom);
                    }

                    var cname = '', disabled = false;
                    for (var i = 0; i < classes.length; i++) {
                        cname += classes[i] + ' ';
                        if (classes[i] === 'disabled')
                            disabled = true;
                    }
                    if (!disabled)
                        cname += 'available';

                    html += '<div ' + 'data-title="' + 'r' + row + 'c' + col + '"' + (cname.indexOf('start-date') !== -1 && cname.indexOf('off') === -1 ? ' tabindex="0"' : ' tabindex="-1"') + 'role="gridcell button"' + 'class="cell ' + cname.replace(/^\s+|\s+$/g, '') + '"' + '><span>' + calendarArray[row][col].date() + '</span></div>';
                    // Added by Stulipan -> tabindex
                }
                html += '</div>';
            }

            html += '</div>';
            html += '</div>';

            this.container.querySelector('.drp-calendar.' + side + ' .calendar-table').innerHTML = html;

        };

        this.renderTimePicker = function(side) {
            // Don't bother updating the time picker if it's currently disabled
            // because an end date hasn't been clicked yet
            if (side === 'right' && !this.endDate) return;

            var html, selected, minDate, maxDate = this.maxDate;

            if (this.maxSpan && (!this.maxDate || this.startDate.clone().add(this.maxSpan).isBefore(this.maxDate)))
                maxDate = this.startDate.clone().add(this.maxSpan);

            if (side === 'left') {
                selected = this.startDate.clone();
                minDate = this.minDate;
            } else if (side === 'right') {
                selected = this.endDate.clone();
                minDate = this.startDate;

                // Preserve the time already selected
                var timeSelector = this.container.querySelector('.drp-calendar.right .calendar-time');
                if (timeSelector.innerHTML !== '') {

                    selected.hour(!isNaN(selected.hour()) ? selected.hour() : timeSelector.querySelector('.hourselect').options[timeSelector.querySelector('.hourselect').selectedIndex].value);
                    selected.minute(!isNaN(selected.minute()) ? selected.minute() : timeSelector.querySelector('.minuteselect').options[timeSelector.querySelector('.minuteselect').selectedIndex].value);
                    selected.second(!isNaN(selected.second()) ? selected.second() : timeSelector.querySelector('.secondselect').options[timeSelector.querySelector('.secondselect').selectedIndex].value);

                    if (!this.timePicker24Hour) {
                        var ampm = timeSelector.querySelector('.ampmselect').options[timeSelector.querySelector('.ampmselect').selectedIndex].value;
                        if (ampm === 'PM' && selected.hour() < 12)
                            selected.hour(selected.hour() + 12);
                        if (ampm === 'AM' && selected.hour() === 12)
                            selected.hour(0);
                    }

                }

                if (selected.isBefore(this.startDate))
                    selected = this.startDate.clone();

                if (maxDate && selected.isAfter(maxDate))
                    selected = maxDate.clone();

            }

            //
            // hours
            //

            html = '<select class="hourselect form-control form-control-sm">';

            var start = this.timePicker24Hour ? 0 : 1;
            var end = this.timePicker24Hour ? 23 : 12;

            for (var i = start; i <= end; i++) {
                var i_in_24 = i;
                if (!this.timePicker24Hour)
                    i_in_24 = selected.hour() >= 12 ? (i === 12 ? 12 : i + 12) : (i === 12 ? 0 : i);

                var time = selected.clone().hour(i_in_24);
                var disabled = false;
                if (minDate && time.minute(59).isBefore(minDate))
                    disabled = true;
                if (maxDate && time.minute(0).isAfter(maxDate))
                    disabled = true;

                if (i_in_24 == selected.hour() && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + i + '</option>';
                } else {
                    html += '<option value="' + i + '">' + i + '</option>';
                }
            }

            html += '</select> ';

            //
            // minutes
            //

            html += ': <select class="minuteselect form-control form-control-sm">';

            for (var i = 0; i < 60; i += this.timePickerIncrement) {
                var padded = i < 10 ? '0' + i : i;
                var time = selected.clone().minute(i);

                var disabled = false;
                if (minDate && time.second(59).isBefore(minDate))
                    disabled = true;
                if (maxDate && time.second(0).isAfter(maxDate))
                    disabled = true;

                if (selected.minute() == i && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                } else {
                    html += '<option value="' + i + '">' + padded + '</option>';
                }
            }

            html += '</select> ';

            //
            // seconds
            //

            if (this.timePickerSeconds) {
                html += ': <select class="secondselect form-control form-control-sm">';

                for (var i = 0; i < 60; i++) {
                    var padded = i < 10 ? '0' + i : i;
                    var time = selected.clone().second(i);

                    var disabled = false;
                    if (minDate && time.isBefore(minDate))
                        disabled = true;
                    if (maxDate && time.isAfter(maxDate))
                        disabled = true;

                    if (selected.second() == i && !disabled) {
                        html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                    } else if (disabled) {
                        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + padded + '</option>';
                    }
                }

                html += '</select> ';
            }

            //
            // AM/PM
            //

            if (!this.timePicker24Hour) {
                html += '<select class="ampmselect form-control form-control-sm">';

                var am_html = '';
                var pm_html = '';

                if (minDate && selected.clone().hour(12).minute(0).second(0).isBefore(minDate))
                    am_html = ' disabled="disabled" class="disabled"';

                if (maxDate && selected.clone().hour(0).minute(0).second(0).isAfter(maxDate))
                    pm_html = ' disabled="disabled" class="disabled"';

                if (selected.hour() >= 12) {
                    html += '<option value="AM"' + am_html + '>AM</option><option value="PM" selected="selected"' + pm_html + '>PM</option>';
                } else {
                    html += '<option value="AM" selected="selected"' + am_html + '>AM</option><option value="PM"' + pm_html + '>PM</option>';
                }

                html += '</select>';
            }

            this.container.querySelector('.drp-calendar.' + side + ' .calendar-time').innerHTML = html;

        };

        this.updateFormInputs = function() {
            if (this.singleDatePicker || (this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)))) {
                var applyBtn = this.container.querySelector('button.drp-apply-btn');
                applyBtn.disabled = false;
            } else {
                var applyBtn = this.container.querySelector('button.drp-apply-btn');
                applyBtn.disabled = true;
            }
        };

        this.move = function() {
            var parentOffset = { top: 0, left: 0 };
            var containerTop;
            var drops = this.drops;

            var parentRightEdge = window.innerWidth;

            if (!this.parentEl.matches('body')) {
                var parentElRect = this.parentEl.getBoundingClientRect();
                parentOffset = {
                    top: parentElRect.top - this.parentEl.scrollTop,
                    left: parentElRect.left - this.parentEl.scrollLeft
                };
                parentRightEdge = parentElRect.width + parentElRect.left;
            }

            switch (drops) {
                case 'auto':
                    containerTop = this.element.getBoundingClientRect().top + this.element.offsetHeight - parentOffset.top;
                    if (containerTop + this.container.offsetHeight >= this.parentEl.scrollHeight) {
                        containerTop = this.element.getBoundingClientRect().top - this.container.offsetHeight - parentOffset.top;
                        drops = 'up';
                    }
                    break;
                case 'up':
                    containerTop = this.element.getBoundingClientRect().top - this.container.offsetHeight - parentOffset.top;
                    break;
                default:
                    containerTop = this.element.getBoundingClientRect().top + this.element.offsetHeight - parentOffset.top;
                    break;
            }

            // Force the container to its actual width
            this.container.style.top = '0';
            this.container.style.left = '0';
            this.container.style.right = 'auto';
            var containerWidth = this.container.offsetWidth;

            // this.container.classList.toggle('drop-up', drops === 'up');
            if (this.container.classList.contains('drop-up')) {
                this.container.classList.remove('drop-up');
            }


            if (this.opens === 'left') {
                var containerRight = parentRightEdge - this.element.getBoundingClientRect().left - this.element.offsetWidth;
                if (containerWidth + containerRight > window.innerWidth) {
                    this.container.style.top = containerTop + 'px';
                    this.container.style.right = 'auto';
                    this.container.style.left = '9px';
                } else {
                    this.container.style.top = containerTop + 'px';
                    this.container.style.right = containerRight + 'px';
                    this.container.style.left = 'auto';
                }
            } else if (this.opens === 'center') {
                var containerLeft = this.element.getBoundingClientRect().left - parentOffset.left + this.element.offsetWidth / 2 - containerWidth / 2;
                if (containerLeft < 0) {
                    this.container.style.top = containerTop + 'px';
                    this.container.style.right = 'auto';
                    this.container.style.left = '9px';
                } else if (containerLeft + containerWidth > window.innerWidth) {
                    this.container.style.top = containerTop + 'px';
                    this.container.style.left = 'auto';
                    this.container.style.right = '0';
                } else {
                    this.container.style.top = containerTop + 'px';
                    this.container.style.left = containerLeft + 'px';
                    this.container.style.right = 'auto';
                }
            } else {
                var containerLeft = this.element.getBoundingClientRect().left - parentOffset.left;
                if (containerLeft + containerWidth > window.innerWidth) {
                    this.container.style.top = containerTop + 'px';
                    this.container.style.left = 'auto';
                    this.container.style.right = '0';
                } else {
                    this.container.style.top = containerTop + 'px';
                    this.container.style.left = containerLeft + 'px';
                    this.container.style.right = 'auto';
                }
            }

        };

        this.show = function() {
            if (this.isShowing) return;

            // if (!this.isShowing) {
            this._outsideClickProxy = (e) => this.outsideClick(e);

            // Bind global datepicker mousedown for hiding and
            document.addEventListener('mousedown', this._outsideClickProxy);
            // Also support mobile devices
            // document.addEventListener('touchend', this._outsideClickProxy); // !!! on mobile devices, scrolling may hide it
            // Also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
            document.addEventListener('click', (e) => {
                if (e.target.matches('[data-toggle=dropdown]')) {
                    this.outsideClick(e);
                }
            });
            // And also close when focus changes to outside the picker (e.g., tabbing between controls)
            document.addEventListener('focusin', this._outsideClickProxy);

            // Reposition the picker if the window is resized while it's open
            window.addEventListener('resize', (e) => this.move(e));

            // Added by Stulipan
            if (!this.displayInlineAlwaysOn) {
                this.backdrop = document.createElement('div');
                this.backdrop.classList.add('drp-backdrop');
                this.backdrop.classList.add('fade', 'show');
                document.body.appendChild(this.backdrop);
            }

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.previousRightTime = this.endDate.clone();

            this.updateView();
            this.container.classList.add('show'); // Added by Stulipan
            this.move();

            this._focusedItemBeforeModal = document.activeElement; // Added by Stulipan
            this._focusOnFirstItem(this.container); // Added by Stulipan

            this.element.dispatchEvent(new Event('show.daterangepicker'));
            this.isShowing = true;
            // }

        };

        this.hide = function(e) {
            if (!this.isShowing) return;

            // Incomplete date selection, revert to last values
            if (!this.endDate) {
                this.startDate = this.oldStartDate.clone();
                this.endDate = this.oldEndDate.clone();
            }

            // If a new date range was selected, invoke the user callback function
            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.callback(this.startDate.clone(), this.endDate.clone(), this.chosenLabel);

            // If picker is attached to a text input, update it
            this.updateElement();

            // If alwaysOn, don't execute the rest;
            if (this.displayInlineAlwaysOn) return;

            //// ?????????????????????  ?????????????????????   ?????????????????????   ?????????????????????   ?????????????????????   ?????????????????????   ?????????????????????   ?????????????????????  ?????????????????????
            document.removeEventListener('mousedown', this._outsideClickProxy);
            // Also support mobile devices
            // document.removeEventListener('touchend', this._outsideClickProxy);
            // Remove Bootstrap dropdown event listener
            document.removeEventListener('click', (e) => {
                if (e.target.matches('[data-toggle=dropdown]')) {
                    this.outsideClick(e);
                }
            });
            // Remove focusin event listener
            document.removeEventListener('focusin', this._outsideClickProxy);
            window.removeEventListener('resize', (e) => this.move(e));

            // this.container.hide();
            this.container.classList.remove('show'); // Added by Stulipan
            this.backdrop.remove(); // Added by Stulipan

            // console.log(this._focusedItemBeforeModal);
            this._focusedItemBeforeModal.focus(); // Not focusing here, it's recommended to focus when using the script.

            const hideEvent = new Event('hide.daterangepicker');
            this.element.dispatchEvent(hideEvent);
            this.isShowing = false;
        };

        this.toggle = function(e) {
            e.preventDefault();   // Added by Stulipan
            e.stopPropagation();  // Added by Stulipan
            if (this.isShowing) {
                this.hide();
            } else {
                this.show();
            }
        };

        this._keydownToggle = function(e) {
            if (e.keyCode === 13) {
                this.toggle(e);
            }
        };

        this.outsideClick = function(e) {
            var target = e.target;

            // if the page is clicked anywhere except within the daterangerpicker/button
            // itself then call this.hide()
            if (
                // ie modal dialog fix
                e.type === "focusin" ||
                this.element.contains(target) ||
                this.container.contains(target) ||
                target.closest('.calendar-table')
            ) return;

            this.hide();
            this.element.dispatchEvent(new Event('outsideClick.daterangepicker'));

        };

        this.showCalendars = function() {
            this.container.classList.add('show-calendar');
            this.move();
            this.element.dispatchEvent(new Event('showCalendar.daterangepicker'));

        };

        this.hideCalendars = function() {
            this.container.classList.remove('show-calendar');
            this.element.dispatchEvent(new Event('hideCalendar.daterangepicker'));
        };

        this.clickRange = function(e) {
            // Remove selected class and set tabindex to -1 for all list items
            var listItems = this.container.querySelectorAll('.drp-ranges li');
            listItems.forEach(function(item) {
                item.classList.remove('selected');
                item.tabIndex = -1;
            });

            // Set tabindex to 0 and focus on the clicked list item
            e.target.tabIndex = 0;
            e.target.focus();

            var label = this.showRangesAsDropdown ? e.target.value : e.target.getAttribute("data-range-key");
            this.chosenLabel = label;

            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];
                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.endOf('day');
                }

                if (!this.alwaysShowCalendars)
                    this.hideCalendars();

                this.updateCalendars();
                this.updateView();

                if (this.autoApply)
                    this.clickApply();
            }

        };

        //// Ezt furcsan irta at, szoval csekkolni kell, hogy jol muxik-e!
        this._navigateRange = function(e) {
            if (38 === e.keyCode || 37 === e.keyCode || 40 === e.keyCode || 39 === e.keyCode) {
                e.preventDefault();
                var ul = e.target.closest('ul');
                var liElements = ul.querySelectorAll('li');
                var selectedActiveLi = ul.querySelector('li.selected.active');
                var activeLi = ul.querySelector('li.active');
                var firstLi = liElements[0];

                if (!selectedActiveLi && !activeLi) {
                    firstLi.tabIndex = 0;
                    firstLi.focus();
                    firstLi.classList.add('active');
                } else {
                    var nextLi;

                    if (38 === e.keyCode || 37 === e.keyCode) {
                        nextLi = selectedActiveLi ? selectedActiveLi.previousElementSibling : activeLi.previousElementSibling;
                        if (!nextLi) {
                            nextLi = ul.querySelector('li:not(.custom):last-child');
                        }
                    } else {
                        nextLi = selectedActiveLi ? selectedActiveLi.nextElementSibling : activeLi.nextElementSibling;
                        if (!nextLi) {
                            nextLi = ul.querySelector('li:not(.custom):first-child');
                        }
                    }

                    if (nextLi) {
                        nextLi.tabIndex = 0;
                        nextLi.focus();
                        nextLi.classList.add('active');
                    }

                    if (selectedActiveLi) {
                        selectedActiveLi.tabIndex = -1;
                        selectedActiveLi.classList.remove('active');
                    }

                    if (activeLi) {
                        activeLi.tabIndex = -1;
                        activeLi.classList.remove('active');
                    }
                }
            }

            if (13 === e.keyCode) {
                e.preventDefault();
                e.stopPropagation();
                this.clickRange(e);
            }

        };

        this.clickPrev = function(e) {
            var target = e.target;
            var cal = null;

            // Find the closest ancestor with the class 'drp-calendar'
            while (target) {
                if (target.classList.contains('drp-calendar')) {
                    cal = target;
                    break;
                }
                target = target.parentElement;
            }

            if (cal && cal.classList.contains('left')) {
                this.leftCalendar.month.subtract(1, 'month');
                if (this.linkedCalendars) {
                    this.rightCalendar.month.subtract(1, 'month');
                }
            } else {
                this.rightCalendar.month.subtract(1, 'month');
            }

            this.updateCalendars();

            // Find and focus the first element with class 'prev' and 'available' within the container
            var prevAvailable = this.container.querySelector('.prev.available');
            if (prevAvailable) {
                prevAvailable.focus();
            }

        };

        this.clickNext = function(e) {
            var target = e.target;
            var cal = null;

            // Find the closest ancestor with the class 'drp-calendar'
            while (target) {
                if (target.classList.contains('drp-calendar')) {
                    cal = target;
                    break;
                }
                target = target.parentElement;
            }

            if (cal && cal.classList.contains('left')) {
                this.leftCalendar.month.add(1, 'month');
            } else {
                this.rightCalendar.month.add(1, 'month');
                if (this.linkedCalendars) {
                    this.leftCalendar.month.add(1, 'month');
                }
            }

            this.updateCalendars();

            // Find and focus the first element with class 'next' and 'available' within the container
            var nextAvailable = this.container.querySelector('.next.available');
            if (nextAvailable) {
                nextAvailable.focus();
            }

        };

        this._keydownPrev = function(e) {
            13 === e.keyCode && this.clickPrev(e);
        };

        this._keydownNext = function(e) {
            13 === e.keyCode && this.clickNext(e);
        };

        this.hoverDate = function() {
            // Ignore dates that can't be selected
            var currentTarget = e.currentTarget;
            if (!currentTarget.classList.contains('available')) return;

            var title = currentTarget.getAttribute('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);

            // Find the closest ancestor with the class 'drp-calendar'
            var target = currentTarget;
            var cal = null;
            while (target) {
                if (target.classList.contains('drp-calendar')) {
                    cal = target;
                    break;
                }
                target = target.parentElement;
            }

            var date;
            if (cal && cal.classList.contains('left')) {
                date = this.leftCalendar.calendar[row][col];
            } else {
                date = this.rightCalendar.calendar[row][col];
            }

            // Highlight the dates between the start date and the date being hovered as a potential end date
            var leftCalendar = this.leftCalendar;
            var rightCalendar = this.rightCalendar;
            var startDate = this.startDate;

            if (!this.endDate) {
                var cellElements = this.container.querySelectorAll('.drp-calendar .days .cell');

                cellElements.forEach(function(el) {
                    // Skip week numbers, only look at dates
                    if (el.classList.contains('week')) return;

                    var title = el.getAttribute('data-title');
                    var row = title.substr(1, 1);
                    var col = title.substr(3, 1);
                    var cal = el.closest('.drp-calendar');
                    var dt = cal.classList.contains('left') ? leftCalendar.calendar[row][col] : rightCalendar.calendar[row][col];

                    if ((dt.isAfter(startDate) && dt.isBefore(date)) || dt.isSame(date, 'day')) {
                        el.classList.add('in-range');
                    } else {
                        el.classList.remove('in-range');
                    }
                });
            }

        };

        this.clickDate = function(e, cell) {

            // // Check if the current target has the 'available' class
            // var currentTarget = e.currentTarget;
            // console.log(e.target);
            // console.log(currentTarget);
            // if (!currentTarget.classList.contains('available')) return;
            //
            // // Get the 'data-title' attribute value
            // var title = currentTarget.getAttribute('data-title');

            var title = cell.getAttribute('data-title');
            var row = title.charAt(1);
            var col = title.charAt(3);

            // Find the closest ancestor with the class 'drp-calendar'
            var target = cell;
            var cal = null;
            while (target) {
                if (target.classList.contains('drp-calendar')) {
                    cal = target;
                    break;
                }
                target = target.parentElement;
            }

            var date;
            if (cal && cal.classList.contains('left')) {
                date = this.leftCalendar.calendar[row][col];
            } else {
                date = this.rightCalendar.calendar[row][col];
            }

            // Handle date selection
            if (this.endDate || date.isBefore(this.startDate, 'day')) { // Picking start
                if (this.timePicker) {
                    var leftHourSelect = this.container.querySelector('.left .hourselect');
                    var hour = parseInt(leftHourSelect.value, 10);

                    if (!this.timePicker24Hour) {
                        var leftAmPmSelect = this.container.querySelector('.left .ampmselect');
                        var ampm = leftAmPmSelect.value;

                        if (ampm === 'PM' && hour < 12) {
                            hour += 12;
                        }
                        if (ampm === 'AM' && hour === 12) {
                            hour = 0;
                        }
                    }

                    var leftMinuteSelect = this.container.querySelector('.left .minuteselect');
                    var minute = parseInt(leftMinuteSelect.value, 10);

                    if (isNaN(minute)) {
                        minute = parseInt(leftMinuteSelect.options[leftMinuteSelect.options.length - 1].value, 10);
                    }

                    var leftSecondSelect = this.timePickerSeconds ? this.container.querySelector('.left .secondselect') : null;
                    var second = leftSecondSelect ? parseInt(leftSecondSelect.value, 10) : 0;

                    date = date.clone().hour(hour).minute(minute).second(second);
                }
                this.endDate = null;
                this.setStartDate(date.clone());
            } else if (!this.endDate && date.isBefore(this.startDate)) {
                // Special case: clicking the same date for start/end, but the time of the end date is before the start date
                this.setEndDate(this.startDate.clone());
            } else { // Picking end
                if (this.timePicker) {
                    var rightHourSelect = this.container.querySelector('.right .hourselect');
                    var hour = parseInt(rightHourSelect.value, 10);

                    if (!this.timePicker24Hour) {
                        var rightAmPmSelect = this.container.querySelector('.right .ampmselect');
                        var ampm = rightAmPmSelect.value;

                        if (ampm === 'PM' && hour < 12) {
                            hour += 12;
                        }
                        if (ampm === 'AM' && hour === 12) {
                            hour = 0;
                        }
                    }

                    var rightMinuteSelect = this.container.querySelector('.right .minuteselect');
                    var minute = parseInt(rightMinuteSelect.value, 10);

                    if (isNaN(minute)) {
                        minute = parseInt(rightMinuteSelect.options[rightMinuteSelect.options.length - 1].value, 10);
                    }

                    var rightSecondSelect = this.timePickerSeconds ? this.container.querySelector('.right .secondselect') : null;
                    var second = rightSecondSelect ? parseInt(rightSecondSelect.value, 10) : 0;

                    date = date.clone().hour(hour).minute(minute).second(second);
                }
                this.setEndDate(date.clone());
                if (this.autoApply) {
                    this.calculateChosenLabel();
                    this.clickApply();
                    // return;  // Added by Stulipan
                }
            }

            if (this.singleDatePicker) {
                this.setEndDate(this.startDate);
                if (!this.timePicker && this.autoApply) {
                    this.clickApply();
                    // return;  // Added by Stulipan
                }
            }

            this.updateView();

            // Added by Stulipan
            // After calendars are rendered, focus on td[tabindex=0].
            // With the above updateView, the updateCalendars is executed, and thus renderCalendar too)
            setTimeout(function() {
                // console.log(cell);
                // console.log(this.container.querySelector('.cell[tabindex="0"]'));
                this.container.querySelector('.cell[tabindex="0"]').focus();
            }.bind(this), 150);

            e.preventDefault();
            // This is to cancel the blur event handler if the mouse was in one of the inputs
            e.stopPropagation();

        };

        this.gotoCell = function(side, newDate) {
            var calendar = side === 'left' ? this.leftCalendar : this.rightCalendar;
            var side = this.container.querySelector('.drp-calendar.' + side);
            var cells = side.querySelectorAll('.days .cell');

            cells.forEach(function(item) {
                if (!item.classList.contains('week')) {

                    var dataTitle = item.getAttribute('data-title');
                    var row = parseInt(dataTitle.charAt(1));
                    var col = parseInt(dataTitle.charAt(3));
                    var currentDate = calendar.calendar[row][col];

                    if (currentDate.isSame(newDate, 'day')) {
                        var selector = `[data-title='r${row}c${col}']`;
                        var cell = side.querySelector(selector);

                        if (cell.classList.contains('off')) return;
                        // this.container.querySelector('.cell[tabindex="0"]').tabIndex = -1;
                        // cell.tabIndex = 0;
                        cell.focus();
                    }
                }
            }.bind(this));

        };

        this._navigateDate = function(e, cell) {
            if (13 === e.keyCode || 37 === e.keyCode || 39 === e.keyCode || 38 === e.keyCode || 40 === e.keyCode) {
                // var currentTarget = e.currentTarget;
                var currentTarget = cell;
                var drpCalendarEl = null;

                // Find the closest ancestor with the class 'drp-calendar'
                var target = currentTarget;
                while (target) {
                    if (target.classList.contains('drp-calendar')) {
                        drpCalendarEl = target;
                        break;
                    }
                    target = target.parentElement;
                }

                if (13 === e.keyCode) {
                    this.clickDate(e, cell);
                    return;
                }

                var dataTitle = currentTarget.getAttribute('data-title');
                var row = parseInt(dataTitle.charAt(1));
                var col = parseInt(dataTitle.charAt(3));
                var daysOffset = 0;

                // Left
                if (37 === e.keyCode) daysOffset = -1;
                // Right
                if (39 === e.keyCode) daysOffset = 1;
                // Up
                if (38 === e.keyCode) daysOffset = -7;
                // Down
                if (40 === e.keyCode) daysOffset = 7;

                e.preventDefault();
                e.stopPropagation();

                var newDate, leftCalendar, rightCalendar;

                if (drpCalendarEl.classList.contains('left')) {
                    newDate = this.leftCalendar.calendar[row][col].clone().add(daysOffset, 'days');
                } else {
                    newDate = this.rightCalendar.calendar[row][col].clone().add(daysOffset, 'days');
                }
                leftCalendar = this.leftCalendar;
                rightCalendar = this.rightCalendar;

                // Sanity check for bad options
                if (newDate.isBefore(this.minDate))
                    newDate = this.minDate.clone();

                if (newDate.isAfter(this.maxDate))
                    newDate = this.maxDate.clone();

                if (drpCalendarEl.classList.contains('left')) {
                    if (newDate.isBefore(leftCalendar.calendar.firstDay)) {
                        drpCalendarEl.querySelector('.prev.available').click();
                    }
                    if (newDate.isAfter(leftCalendar.calendar.lastDay)) {
                        if (this.singleDatePicker) {
                            drpCalendarEl.querySelector('.next.available').click();
                        }
                        this.gotoCell('right', newDate);
                    }
                    this.gotoCell('left', newDate);
                }
                if (drpCalendarEl.classList.contains('right')) {
                    if (newDate.isAfter(rightCalendar.calendar.lastDay)) {
                        drpCalendarEl.querySelector('.next.available').click();
                    }
                    if (newDate.isBefore(rightCalendar.calendar.firstDay)) {
                        this.gotoCell('left', newDate);
                    }
                    this.gotoCell('right', newDate);
                }
                // currentTarget.tabIndex = -1;
            }

        };

        this.calculateChosenLabel = function() {
            var customRange = true;
            var i = 0;

            for (var range in this.ranges) {
                var format = this.timePickerSeconds ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD HH:mm";
                var selectedRange;

                if (this.timePicker) {
                    if (this.startDate.format(format) == this.ranges[range][0].format(format) &&
                        this.endDate.format(format) == this.ranges[range][1].format(format)) {
                        customRange = false;

                        if (this.showRangesAsDropdown) {
                            selectedRange = this.container.querySelector(".drp-ranges option:nth-child(" + (i + 1) + ")");
                            selectedRange.selected = true;
                            this.chosenLabel = selectedRange.getAttribute("data-range-key");
                        } else {
                            selectedRange = this.container.querySelector('.drp-ranges li:nth-child(' + (i + 1) + ')');
                            selectedRange.classList.add('selected', 'active');
                            this.chosenLabel = selectedRange.getAttribute('data-range-key');
                        }
                        break;
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') &&
                        this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;

                        if (this.showRangesAsDropdown) {
                            selectedRange = this.container.querySelector(".drp-ranges option:nth-child(" + (i + 1) + ")");
                            selectedRange.selected = true;
                            this.chosenLabel = selectedRange.getAttribute("data-range-key");
                        } else {
                            this.container.querySelectorAll(".drp-ranges li").forEach(function(li) {
                                li.classList.remove('selected', 'active');
                                li.tabIndex = -1;
                            });

                            selectedRange = this.container.querySelector('.drp-ranges li:nth-child(' + (i + 1) + ')');
                            selectedRange.tabIndex = 0;
                            selectedRange.classList.add('selected', 'active');
                            this.chosenLabel = selectedRange.getAttribute('data-range-key');
                        }
                        break;
                    }
                }

                i++;
            }

            if (customRange) {
                if (this.showCustomRangeLabel) {
                    var selectedRange;

                    if (this.showRangesAsDropdown) {
                        selectedRange = this.container.querySelector('.drp-ranges option:last-of-type');
                        selectedRange.selected = true;
                        this.chosenLabel = selectedRange.getAttribute("data-range-key");
                    } else {
                        this.container.querySelectorAll(".drp-ranges li").forEach(function(li) {
                            li.classList.remove('selected', 'active');
                            li.tabIndex = -1;
                        });

                        let lastRange = this.container.querySelector('.drp-ranges li:last-of-type');
                        lastRange.tabIndex = 0;
                        lastRange.classList.add('selected', 'active');
                        this.chosenLabel = lastRange.getAttribute('data-range-key');
                    }
                } else {
                    this.chosenLabel = null;
                }
                this.showCalendars();
            }
        };

        this.clickApply = function(e) {
            this.hide();
            this.element.dispatchEvent(new Event('apply.daterangepicker'));
        };

        this.clickCancel = function(e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.hide();
            this.element.dispatchEvent(new Event('cancel.daterangepicker'));
        };

        this.monthOrYearChanged = function(e) {
            var isLeft = e.target.closest('.drp-calendar').classList.contains('left');
            var side = isLeft ? 'left' : 'right';
            var cal = this.container.querySelector('.drp-calendar.' + side);

            // Month must be a Number for new moment versions
            var month = parseInt(cal.querySelector('.monthselect').value, 10);
            var year = cal.querySelector('.yearselect').value;

            if (!isLeft) {
                if (year < this.startDate.year() || (year == this.startDate.year() && month < this.startDate.month())) {
                    month = this.startDate.month();
                    year = this.startDate.year();
                }
            }

            if (this.minDate) {
                if (year < this.minDate.year() || (year == this.minDate.year() && month < this.minDate.month())) {
                    month = this.minDate.month();
                    year = this.minDate.year();
                }
            }

            if (this.maxDate) {
                if (year > this.maxDate.year() || (year == this.maxDate.year() && month > this.maxDate.month())) {
                    month = this.maxDate.month();
                    year = this.maxDate.year();
                }
            }

            if (isLeft) {
                this.leftCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
            } else {
                this.rightCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
            }
            this.updateCalendars();

        };

        this.timeChanged = function(e) {
            var cal = e.target.closest('.drp-calendar');
            var isLeft = cal.classList.contains('left');

            var hour = parseInt(cal.querySelector('.hourselect').value, 10);
            var minute = parseInt(cal.querySelector('.minuteselect').value, 10);
            if (isNaN(minute)) {
                minute = parseInt(cal.querySelector('.minuteselect option:last-of-type').value, 10);
            }
            var second = this.timePickerSeconds ? parseInt(cal.querySelector('.secondselect').value, 10) : 0;

            if (!this.timePicker24Hour) {
                var ampm = cal.querySelector('.ampmselect').value;
                if (ampm === 'PM' && hour < 12)
                    hour += 12;
                if (ampm === 'AM' && hour === 12)
                    hour = 0;
            }

            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                start.second(second);
                this.setStartDate(start);
                if (this.singleDatePicker) {
                    this.endDate = this.startDate.clone();
                } else if (this.endDate && this.endDate.format('YYYY-MM-DD') == start.format('YYYY-MM-DD') && this.endDate.isBefore(start)) {
                    this.setEndDate(start.clone());
                }
            } else if (this.endDate) {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                end.second(second);
                this.setEndDate(end);
            }

            // Update the calendars so all clickable dates reflect the new time component
            this.updateCalendars();

            // Update the form inputs above the calendars with the new time
            this.updateFormInputs();

            // Re-render the time pickers because changing one selection can affect what's enabled in another
            this.renderTimePicker('left');
            this.renderTimePicker('right');
        };

        this.elementChanged = function() {
            if (!this.element || this.element.tagName !== 'INPUT') return;
            if (!this.element.value.length) return;

            var dateString = this.element.value.split(this.locale.separator),
                start = null,
                end = null;

            if (dateString.length === 2) {
                start = moment(dateString[0], this.locale.format);
                end = moment(dateString[1], this.locale.format);
            }

            if (this.singleDatePicker || start === null || end === null) {
                start = moment(this.element.value, this.locale.format);
                end = start;
            }

            if (!start.isValid() || !end.isValid()) return;

            this.setStartDate(start);
            this.setEndDate(end);
            this.updateView();

        };

        this._keydown = function(e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                e.stopPropagation();
                this.show();
            }
        };

        this._trapEscapeKey = function(e) {
            // if focus is in the modal, on Escape this will close modal
            if (27 === e.keyCode) {
                e.preventDefault();
                e.stopPropagation();
                this.hide();
            }
        };

        this._trapTabKey = function(e) {
            // if tab or shift-tab pressed
            if (e.keyCode === 9) {
                let focusableItems = Array.from(this.container.querySelectorAll('*')).filter(element => {
                    return element.matches(this._focusableItemsString) && element.offsetParent !== null;
                }); // get list of focusable items

                let focusedItem = document.activeElement; // get currently focused item
                let numberOfFocusableItems = focusableItems.length; // get the number of focusable items
                let focusedItemIndex = focusableItems.indexOf(focusedItem); // get the index of the currently focused item

                if (e.shiftKey) {
                    // back tab
                    if (focusedItemIndex === 0) {
                        focusableItems[numberOfFocusableItems - 1].focus();
                        e.preventDefault();
                    }
                } else {
                    // if focused on the last item and user presses tab, go to the first focusable item
                    if (focusedItemIndex === numberOfFocusableItems - 1) {
                        focusableItems[0].focus();
                        e.preventDefault();
                    }
                }
            }

        };

        this._focusOnFirstItem = function() {
            var focusableItems = Array.from(this.container.querySelectorAll('*')).filter(element => {
                return element.matches(this._focusableItemsString) && element.offsetParent !== null;
            });

            var startDateFocusableItem = focusableItems.find(item => item.classList.contains('start-date'));

            if (startDateFocusableItem) {
                startDateFocusableItem.focus();
            } else {
                var visibleFocusableItems = focusableItems.filter(item => item.offsetWidth > 0 || item.offsetHeight > 0);
                if (visibleFocusableItems.length > 0) {
                    visibleFocusableItems[0].focus();
                }
            }

        };

        this.updateElement = function(e) {
            if (this.element && this.element.tagName === 'INPUT' && this.autoUpdateInput) {
                var newValue = this.startDate.format(this.locale.format);
                if (!this.singleDatePicker) {
                    newValue += this.locale.separator + this.endDate.format(this.locale.format);
                }
                if (newValue !== this.element.value) {
                    this.element.value = newValue;
                    this.element.dispatchEvent(new Event('change'));
                }
            }

        };

        this.remove = function() {
            if (this.container) {
                this.container.parentNode.removeChild(this.container);
            }

            // Clone the node in order to remove all event listeners on it.
            // Be careful, as this will also clear event listeners on all child elements of the node in question.
            var oldElement = this.element;
            var newElement = oldElement.cloneNode(true);
            oldElement.parentNode.replaceChild(newElement, oldElement);
        }


        // Call the initialization function
        this.init(element, options, cb);
    };

    window.stulipan = stulipan;
}));


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = stulipan;
}
