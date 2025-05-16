import { Locator, Page } from "@playwright/test";
import { BasePage, step } from "../base-page.js";

/**
 * DatePicker Component for handling React datepicker interactions
 * This component provides utility methods to interact with datepicker fields.
 * It assumes there is only one active datepicker on the screen at any time.
 */
export class DatePicker extends BasePage {
    // Calendar locators
    readonly calendarContainer: Locator;
    readonly monthYearHeader: Locator;
    readonly daysCells: Locator;
    readonly clearButton: Locator;
    readonly nextMonthButton: Locator;
    readonly prevMonthButton: Locator;

    /**
     * Constructor
     * @param page - Playwright page object
     */
    constructor(page: Page) {
        super(page);

        // Initialize calendar-related locators
        this.calendarContainer = this.page.locator(".react-datepicker__month-container");
        this.monthYearHeader = this.calendarContainer.locator(".react-datepicker__current-month");
        this.daysCells = this.page.locator(
            ".react-datepicker__day:not(.react-datepicker__day--outside-month)"
        );
        this.clearButton = this.page.locator(".react-datepicker__close-icon");
        this.nextMonthButton = this.page.locator(".react-datepicker__navigation--next");
        this.prevMonthButton = this.page.locator(".react-datepicker__navigation--previous");
    }

    /**
     * Checks if the calendar is currently visible
     */
    async isCalendarVisible(): Promise<boolean> {
        return await this.calendarContainer.isVisible();
    }

    /**
     * Select a date by clicking on the day
     * @param day - Day of the month
     * @param month - Month (1-12)
     * @param year - Full year (e.g., 2025)
     */
    @step()
    async selectDate(day: number, month: number, year: number): Promise<void> {
        // Wait for the calendar to be visible
        await this.calendarContainer.waitFor({ state: "visible" });

        // Navigate to the correct month and year
        await this.navigateToMonthAndYear(month, year);

        // Click the day
        const dayCell = this.page.locator(
            `.react-datepicker__day:not(.react-datepicker__day--outside-month):text("${day}")`
        );
        await dayCell.click();
    }

    /**
     * Navigate to a specific month and year in the datepicker
     * @param targetMonth - Month to navigate to (1-12)
     * @param targetYear - Year to navigate to
     */
    @step("Navigate calendar to specific month and year")
    async navigateToMonthAndYear(targetMonth: number, targetYear: number): Promise<void> {
        // Get the current month and year from the header
        const currentMonthYearText = (await this.monthYearHeader.textContent()) || "";

        // Parse the current month and year
        const [currentMonthName, currentYearStr] = currentMonthYearText.trim().split(" ");
        const currentYear = parseInt(currentYearStr);

        // Convert month name to number (1-12)
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const currentMonth = monthNames.indexOf(currentMonthName) + 1;

        // Calculate the number of months to navigate
        let monthsToNavigate = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

        // Navigate forward or backward
        while (monthsToNavigate !== 0) {
            if (monthsToNavigate > 0) {
                // Navigate forward
                await this.nextMonthButton.click();
                monthsToNavigate--;
            } else {
                // Navigate backward
                await this.prevMonthButton.click();
                monthsToNavigate++;
            }
            // Small delay to allow the calendar to update
            await this.page.waitForTimeout(100);
        }
    }

    /**
     * Clear the selected date
     */
    async clearDate(): Promise<void> {
        // Check if a date is selected (clear button is visible)
        if (await this.clearButton.isVisible()) {
            await this.clearButton.click();
        }
    }

    /**
     * Select a date using the DD/MM/YY format
     * @param dateString - Date string in format DD/MM/YY
     */
    @step()
    async selectDateFromString(dateString: string): Promise<void> {
        // Parse the date string (DD/MM/YY) to extract day, month, and year
        const [day, month, yearShort] = dateString.split("/").map((part) => parseInt(part));

        // Convert 2-digit year to 4-digit year
        const currentCentury = Math.floor(new Date().getFullYear() / 100) * 100;
        const year = currentCentury + yearShort;

        // Select the date
        await this.selectDate(day, month, year);
    }

    /**
     * Select a relative date (e.g., today, tomorrow, next week)
     * @param relative - Relative date type ("today", "tomorrow", "nextWeek", "nextMonth")
     */
    @step()
    async selectRelativeDate(
        relative: "today" | "tomorrow" | "nextWeek" | "nextMonth"
    ): Promise<void> {
        const today = new Date();
        let date: Date;

        switch (relative) {
            case "today":
                date = today;
                break;
            case "tomorrow":
                date = new Date(today);
                date.setDate(today.getDate() + 1);
                break;
            case "nextWeek":
                date = new Date(today);
                date.setDate(today.getDate() + 7);
                break;
            case "nextMonth":
                date = new Date(today);
                date.setMonth(today.getMonth() + 1);
                break;
            default:
                date = today;
        }

        // Select the calculated date
        await this.selectDate(
            date.getDate(),
            date.getMonth() + 1, // Convert from 0-indexed to 1-indexed
            date.getFullYear()
        );
    }
}
