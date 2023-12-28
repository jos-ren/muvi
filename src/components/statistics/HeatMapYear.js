import CalHeatmap from 'cal-heatmap';
import Tooltip from 'cal-heatmap/plugins/Tooltip';
import LegendLite from 'cal-heatmap/plugins/LegendLite';
import CalendarLabel from 'cal-heatmap/plugins/CalendarLabel';
import 'cal-heatmap/cal-heatmap.css';
import { Button } from "antd"
export default function HeatMapYear({ data }) {

    const sameRowDayTemplate = function (DateHelper) {
        return {
            name: 'day_same_row',
            parent: 'day',
            rowsCount() {
                return 1;
            },
            columnsCount() {
                return 31;
            },
            mapping: (startDate, endDate, defaultValues) =>
                DateHelper.intervals('day', startDate, DateHelper.date(endDate)).map(
                    (d, index) => ({
                        t: d,
                        x: index,
                        y: 0,
                        ...defaultValues,
                    })
                ),
            // Missing extractUnit property, will be inherit from parent
        };
    };

    const cal = new CalHeatmap();
    cal.addTemplates(sameRowDayTemplate);
    // if (process.browser) {
    cal.paint(
        {
            data: {
                source: data,
                x: 'date',
                y: d => +d['value'],
                groupY: 'max',
            },
            // first day of this year
            date: { start: new Date(new Date().getFullYear(), 0, 1) },
            scale: {
                color: {
                    type: 'quantize',
                    range: ['#4dd05a', '#37a446', '#166b34', '#14432a'],
                    // range: ['#b5d4f4', '#6ea3e8', '#2389ff', '#0a3a6b'],
                    domain: [1, 2, 3, 4],
                },
            },
            range: 1,
            // domain: {
            //     type: 'year',
            //     gutter: 4,
            //     label: { text: 'MMM', textAlign: 'start', position: 'top' },
            // },
            // subDomain: { type: 'day', radius: 2, width: 11, height: 11, gutter: 4 },

            domain: {
                type: 'year',
                gutter: 4,
                label: { text: 'YYYY', textAlign: 'start', position: 'top' },
            },
            subDomain: { type: 'day', radius: 2, width: 11, height: 11, gutter: 4 },
            itemSelector: '#ex-ghDay',
        },
        [
            [
                Tooltip,
                {
                    text: function (date, value, dayjsDate) {
                        return (
                            (value ? value : 'No') + ' released on ' + dayjsDate.format('MMMM DD, YYYY')
                        );
                    },
                },
            ],
            [
                LegendLite,
                {
                    includeBlank: true,
                    itemSelector: '#ex-ghDay-legend',
                    radius: 2,
                    width: 11,
                    height: 11,
                    gutter: 4,
                },
            ],
            [
                CalendarLabel,
                {
                    width: 30,
                    textAlign: 'start',
                    text: () => dayjs.weekdaysShort().map((d, i) => (i % 2 == 0 ? '' : d)),
                    padding: [25, 0, 0, 0],
                },
            ],
        ]
    );

    // }

    return (
        <div
            style={{
                // background: '#22272d',
                color: '#adbac7',
                borderRadius: '3px',
                padding: '1rem',
                overflow: 'hidden',
                border: "1px solid red",
                width: "100%"
            }}
        >
            <div id="ex-ghDay" className="margin-bottom--md"></div>
            <Button
                className="button button--sm button--secondary margin-top--sm"
                href="#"
                onClick={e => {
                    e.preventDefault();
                    cal.previous();
                }}
            >
                ← Previous
            </Button>

            <Button
                className="button button--sm button--secondary margin-top--sm margin-left--xs"
                href="#"
                onClick={e => {
                    e.preventDefault();
                    cal.next();
                }}
            >
                Next →
            </Button>
            <div style={{ float: 'right', fontSize: 12 }}>
                <span style={{ color: '#768390' }}>Less</span>
                <div
                    id="ex-ghDay-legend"
                    style={{ display: 'inline-block', margin: '0 4px' }}
                ></div>
                <span style={{ color: '#768390', fontSize: 12 }}>More</span>
            </div>
        </div>
    )
}