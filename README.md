# StulipanDateRangePicker
A standalone date range picker component.

## How to use it?

    var dateInput = document.querySelectorAll('#config-demo');
    dateInput.daterangepicker(customConfig, callback);

Another way of using this is as a global object:

    stulipan.daterangepicker('#config-demo', customConfig, callback);

## Configuration
Here's an example of how `customConfig` may look like. For a complete list of configuration options, please consult the `demo.html`

    var customConfig = {
        singleDatePicker: false,
        // displayInline: true,
        // displayInlineAlwaysOn: true,
        opens: 'right',
        drops: 'down',
        autoApply: false,
        autoUpdateInput: true,
        alwaysShowCalendars: true,
        showCustomRangeLabel: true,
        // showRangesAsDropdown: true,
        maxDate: moment(),
        locale: {
            format: "YYYY/MM/DD",
            separator: ' - ',
            cancelLabel: 'Mégse',
            applyLabel: 'Mehet',
            daysOfWeek: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
            monthNames: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
            firstDay: 1,
            dropdownRangeLabel: 'Időintervallumok',
            customRangeLabel: 'Egyedi időszak',
        },
        buttonClasses: 'btn',
        cancelClass: 'btn-secondary',

        ranges: {
            'Ma': [moment(), moment()],
            'Tegnap': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            "Aktuális hónap": [moment().startOf('month'), moment().endOf('month')],
            "Előző hónap": [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            "Utolsó 7 nap": [moment().subtract(6, 'days'), moment()],
            "Utolsó 30 nap": [moment().subtract(29, 'days'), moment()],
            "Aktuális év": [moment().startOf('year'), moment().endOf('year')],
            "Előző év": [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
            "Élettartam": [moment('1990-01-01'), moment()],
        },
    });
