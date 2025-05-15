// Date Range Picker with Presets

class DateRangePicker {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            startDateId: 'start-date',
            endDateId: 'end-date',
            presets: [
                { label: 'Today', days: 0 },
                { label: 'Yesterday', days: -1 },
                { label: 'Last 7 days', days: -7 },
                { label: 'This month', type: 'thisMonth' },
                { label: 'Last month', type: 'lastMonth' },
                { label: 'This year', type: 'thisYear' },
                { label: 'Last year', type: 'lastYear' },
                { label: 'Custom Range', type: 'custom' }
            ],
            onChange: null,
            ...options
        };
        
        this.isOpen = false;
        this.startDate = null;
        this.endDate = null;
        this.isArabic = document.documentElement.lang === 'ar';
        this.inRangeSelection = false;
        this.tempStartDate = null;
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        // Create main container
        this.container.classList.add('date-range-picker-container');
        
        // Create the input display
        this.displayElement = document.createElement('div');
        this.displayElement.className = 'date-range-display';
        
        // Calendar icon
        const calendarIcon = document.createElement('i');
        calendarIcon.className = 'fas fa-calendar';
        this.displayElement.appendChild(calendarIcon);
        
        // Display text
        this.displayText = document.createElement('span');
        this.displayText.className = 'date-range-text';
        this.displayText.textContent = this.isArabic ? 'اختر نطاق التاريخ' : 'Select date range';
        this.displayElement.appendChild(this.displayText);
        
        // Dropdown arrow
        const arrowIcon = document.createElement('i');
        arrowIcon.className = 'fas fa-chevron-down';
        this.displayElement.appendChild(arrowIcon);
        
        // Create the dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'date-range-dropdown';
        
        // Create preset section
        const presetSection = document.createElement('div');
        presetSection.className = 'date-range-presets';
        
        // Add presets
        this.options.presets.forEach(preset => {
            const presetBtn = document.createElement('button');
            presetBtn.className = 'date-range-preset';
            presetBtn.textContent = this.isArabic ? this.getArabicLabel(preset.label) : preset.label;
            presetBtn.dataset.preset = preset.type || preset.days;
            presetSection.appendChild(presetBtn);
        });
        
        this.dropdown.appendChild(presetSection);
        
        // Create the calendar overlay for custom range
        this.calendarOverlay = document.createElement('div');
        this.calendarOverlay.className = 'calendar-overlay';
        
        // Create calendar container
        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';
        
        // Calendar header with month/year navigation
        const calendarHeader = document.createElement('div');
        calendarHeader.className = 'calendar-header';
        
        // Previous month button
        const prevMonthBtn = document.createElement('button');
        prevMonthBtn.className = 'calendar-nav-btn prev-month';
        prevMonthBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        calendarHeader.appendChild(prevMonthBtn);
        
        // Month/Year display
        this.monthYearDisplay = document.createElement('div');
        this.monthYearDisplay.className = 'month-year-display';
        calendarHeader.appendChild(this.monthYearDisplay);
        
        // Next month button
        const nextMonthBtn = document.createElement('button');
        nextMonthBtn.className = 'calendar-nav-btn next-month';
        nextMonthBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        calendarHeader.appendChild(nextMonthBtn);
        
        calendarContainer.appendChild(calendarHeader);
        
        // Calendar body with days
        this.calendarBody = document.createElement('div');
        this.calendarBody.className = 'calendar-body';
        calendarContainer.appendChild(this.calendarBody);
        
        // Calendar footer with buttons
        const calendarFooter = document.createElement('div');
        calendarFooter.className = 'calendar-footer';
        
        // Apply button
        const applyBtn = document.createElement('button');
        applyBtn.className = 'calendar-apply-btn';
        applyBtn.textContent = this.isArabic ? 'تطبيق' : 'Apply';
        calendarFooter.appendChild(applyBtn);
        
        // Cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'calendar-cancel-btn';
        cancelBtn.textContent = this.isArabic ? 'إلغاء' : 'Cancel';
        calendarFooter.appendChild(cancelBtn);
        
        // Clear button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'calendar-clear-btn';
        clearBtn.textContent = this.isArabic ? 'مسح' : 'Clear';
        calendarFooter.appendChild(clearBtn);
        
        calendarContainer.appendChild(calendarFooter);
        this.calendarOverlay.appendChild(calendarContainer);
        
        // Add elements to container
        this.container.appendChild(this.displayElement);
        this.container.appendChild(this.dropdown);
        document.body.appendChild(this.calendarOverlay);
    }
    
    getArabicLabel(label) {
        const arabicLabels = {
            'Today': 'اليوم',
            'Yesterday': 'أمس',
            'Last 7 days': 'آخر ٧ أيام',
            'This month': 'هذا الشهر',
            'Last month': 'الشهر الماضي',
            'This year': 'هذا العام',
            'Last year': 'العام الماضي',
            'Custom Range': 'نطاق مخصص'
        };
        return arabicLabels[label] || label;
    }
    
    attachEvents() {
        // Toggle dropdown on display click
        this.displayElement.addEventListener('click', () => {
            this.toggleDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && this.isOpen) {
                this.closeDropdown();
            }
        });
        
        // Preset buttons
        const presetButtons = this.dropdown.querySelectorAll('.date-range-preset');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const presetValue = btn.dataset.preset;
                
                if (presetValue === 'custom') {
                    this.openCalendarOverlay();
                } else {
                    this.applyPreset(presetValue);
                }
            });
        });
        
        // Calendar navigation
        const prevMonthBtn = this.calendarOverlay.querySelector('.prev-month');
        const nextMonthBtn = this.calendarOverlay.querySelector('.next-month');
        
        prevMonthBtn.addEventListener('click', () => {
            this.changeMonth(-1);
        });
        
        nextMonthBtn.addEventListener('click', () => {
            this.changeMonth(1);
        });
        
        // Calendar buttons
        const applyBtn = this.calendarOverlay.querySelector('.calendar-apply-btn');
        const cancelBtn = this.calendarOverlay.querySelector('.calendar-cancel-btn');
        const clearBtn = this.calendarOverlay.querySelector('.calendar-clear-btn');
        
        applyBtn.addEventListener('click', () => {
            if (this.startDate && this.endDate) {
                this.updateDisplay();
                this.closeCalendarOverlay();
                this.closeDropdown();
                this.notifyChange();
            } else {
                alert(this.isArabic ? 'يرجى تحديد تاريخ البدء والانتهاء' : 'Please select both start and end dates');
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.closeCalendarOverlay();
        });
        
        clearBtn.addEventListener('click', () => {
            this.clearDateRange();
            this.closeCalendarOverlay();
        });
    }
    
    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        this.dropdown.style.display = 'block';
        this.isOpen = true;
        
        // Add click outside listener
        setTimeout(() => {
            document.addEventListener('click', this.outsideClickHandler);
        }, 10);
    }
    
    closeDropdown() {
        this.dropdown.style.display = 'none';
        this.isOpen = false;
        
        // Remove click outside listener
        document.removeEventListener('click', this.outsideClickHandler);
    }
    
    outsideClickHandler = (e) => {
        if (!this.container.contains(e.target)) {
            this.closeDropdown();
        }
    }
    
    openCalendarOverlay() {
        this.closeDropdown();
        this.calendarOverlay.style.display = 'flex';
        this.renderCalendar();
        
        // Prevent scrolling when overlay is open
        document.body.style.overflow = 'hidden';
    }
    
    closeCalendarOverlay() {
        this.calendarOverlay.style.display = 'none';
        document.body.style.overflow = '';
        this.inRangeSelection = false;
    }
    
    renderCalendar() {
        const currentDate = new Date();
        this.currentMonth = this.currentMonth || currentDate.getMonth();
        this.currentYear = this.currentYear || currentDate.getFullYear();
        
        // Update month/year display
        const monthNames = this.isArabic ? 
            ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'] :
            ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        this.monthYearDisplay.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Clear previous calendar
        this.calendarBody.innerHTML = '';
        
        // Create days of week header
        const daysOfWeek = this.isArabic ?
            ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'] :
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const weekHeader = document.createElement('div');
        weekHeader.className = 'calendar-weekdays';
        
        daysOfWeek.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'weekday';
            dayElement.textContent = day;
            weekHeader.appendChild(dayElement);
        });
        
        this.calendarBody.appendChild(weekHeader);
        
        // Create calendar days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        let startingDayOfWeek = firstDay.getDay();
        if (this.isArabic) {
            // Adjust for Arabic calendar (week starts on Saturday)
            startingDayOfWeek = (startingDayOfWeek + 1) % 7;
        }
        
        const calendarDays = document.createElement('div');
        calendarDays.className = 'calendar-days';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.dataset.date = this.formatDateForInput(date);
            
            // Check if this day is in the selected range
            if (this.startDate && this.endDate) {
                if (date >= this.startDate && date <= this.endDate) {
                    dayElement.classList.add('in-range');
                }
                
                if (date.toDateString() === this.startDate.toDateString()) {
                    dayElement.classList.add('range-start');
                }
                
                if (date.toDateString() === this.endDate.toDateString()) {
                    dayElement.classList.add('range-end');
                }
            }
            
            // Add click event for day selection
            dayElement.addEventListener('click', () => {
                this.handleDayClick(date);
            });
            
            calendarDays.appendChild(dayElement);
        }
        
        this.calendarBody.appendChild(calendarDays);
    }
    
    changeMonth(delta) {
        this.currentMonth += delta;
        
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        
        this.renderCalendar();
    }
    
    handleDayClick(date) {
        if (!this.inRangeSelection) {
            // First click - start date
            this.startDate = new Date(date);
            this.endDate = null;
            this.inRangeSelection = true;
            this.tempStartDate = new Date(date);
        } else {
            // Second click - end date
            if (date < this.tempStartDate) {
                this.startDate = new Date(date);
                this.endDate = new Date(this.tempStartDate);
            } else {
                this.startDate = new Date(this.tempStartDate);
                this.endDate = new Date(date);
            }
            this.inRangeSelection = false;
        }
        
        this.renderCalendar();
    }
    
    applyPreset(preset) {
        const today = new Date();
        let start, end;
        
        if (preset === 'thisYear') {
            // This year: Jan 1 to Dec 31 of current year
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear(), 11, 31);
        } else if (preset === 'lastYear') {
            // Last year: Jan 1 to Dec 31 of previous year
            start = new Date(today.getFullYear() - 1, 0, 1);
            end = new Date(today.getFullYear() - 1, 11, 31);
        } else if (preset === 'thisMonth') {
            // This month: 1st day to last day of current month
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (preset === 'lastMonth') {
            // Last month: 1st day to last day of previous month
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
        } else {
            // Days-based presets
            const days = parseInt(preset);
            if (days === 0) {
                // Today
                start = new Date(today);
                end = new Date(today);
            } else {
                // Days ago to today
                start = new Date(today);
                start.setDate(start.getDate() + days);
                end = new Date(today);
            }
        }
        
        this.startDate = start;
        this.endDate = end;
        
        this.updateDisplay();
        this.closeDropdown();
        this.notifyChange();
    }
    
    clearDateRange() {
        this.startDate = null;
        this.endDate = null;
        
        // Reset display text
        this.displayText.textContent = this.isArabic ? 'اختر نطاق التاريخ' : 'Select date range';
        
        // Reset the hidden input elements
        const startDateEl = document.getElementById(this.options.startDateId);
        const endDateEl = document.getElementById(this.options.endDateId);
        
        if (startDateEl) startDateEl.value = '';
        if (endDateEl) endDateEl.value = '';
        
        // Notify any change listeners
        this.notifyChange();
    }
    
    updateDisplay() {
        if (this.startDate && this.endDate) {
            const startFormatted = this.formatDisplayDate(this.startDate);
            const endFormatted = this.formatDisplayDate(this.endDate);
            
            // Check if start and end dates are the same
            if (this.startDate.toDateString() === this.endDate.toDateString()) {
                this.displayText.textContent = startFormatted;
            } else {
                this.displayText.textContent = `${startFormatted} - ${endFormatted}`;
            }
        } else {
            this.displayText.textContent = this.isArabic ? 'اختر نطاق التاريخ' : 'Select date range';
        }
    }
    
    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }
    
    formatDisplayDate(date) {
        return date.toLocaleDateString(this.isArabic ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    notifyChange() {
        // Get actual DOM elements for compatibility with existing code
        const startDateEl = document.getElementById(this.options.startDateId);
        const endDateEl = document.getElementById(this.options.endDateId);
        
        // Update actual DOM elements
        if (startDateEl) {
            startDateEl.value = this.startDate ? this.formatDateForInput(this.startDate) : '';
        }
        
        if (endDateEl) {
            endDateEl.value = this.endDate ? this.formatDateForInput(this.endDate) : '';
        }
        
        // Trigger a change event on both inputs
        if (startDateEl) {
            startDateEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (endDateEl) {
            endDateEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Update clear filters button state if the function exists
        if (typeof updateFilterButtonOnChange === 'function') {
            updateFilterButtonOnChange();
        }
        
        // Call onChange callback if provided
        if (typeof this.options.onChange === 'function') {
            this.options.onChange({
                startDate: this.startDate,
                endDate: this.endDate
            });
        }
    }
    
    // Public methods to get current values
    getStartDate() {
        return this.startDate;
    }
    
    getEndDate() {
        return this.endDate;
    }
    
    // Method to set date programmatically
    setDateRange(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        
        this.updateDisplay();
    }
}

// Initialize the picker when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if the date filter element exists
    const dateFilterContainer = document.querySelector('.filter-group.date-filter');
    if (dateFilterContainer) {
        // Remove the old date range inputs
        const oldInputs = dateFilterContainer.querySelector('.date-range-inputs');
        if (oldInputs) {
            oldInputs.remove();
        }
        
        // Create a container for the new date picker
        const datePickerContainer = document.createElement('div');
        datePickerContainer.className = 'date-picker-container';
        dateFilterContainer.appendChild(datePickerContainer);
        
        // Create hidden inputs if they don't exist
        if (!document.getElementById('start-date')) {
            const startInput = document.createElement('input');
            startInput.type = 'hidden';
            startInput.id = 'start-date';
            dateFilterContainer.appendChild(startInput);
        }
        
        if (!document.getElementById('end-date')) {
            const endInput = document.createElement('input');
            endInput.type = 'hidden';
            endInput.id = 'end-date';
            dateFilterContainer.appendChild(endInput);
        }
        
        // Initialize the date range picker
        const dateRangePicker = new DateRangePicker(datePickerContainer);
        
        // Store a reference globally so other scripts can access it
        window.dateRangePicker = dateRangePicker;
        
        // Check for existing values and apply them
        const startDateEl = document.getElementById('start-date');
        const endDateEl = document.getElementById('end-date');
        
        if (startDateEl && startDateEl.value && endDateEl && endDateEl.value) {
            dateRangePicker.setDateRange(
                new Date(startDateEl.value),
                new Date(endDateEl.value)
            );
        }
    }
}); 