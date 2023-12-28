import CalHeatmap from 'cal-heatmap';
import Tooltip from 'cal-heatmap/plugins/Tooltip';
import LegendLite from 'cal-heatmap/plugins/LegendLite';
import CalendarLabel from 'cal-heatmap/plugins/CalendarLabel';
import 'cal-heatmap/cal-heatmap.css';

export default function HeatMap({ data }) {
    // if (process.browser) {
    const cal = new CalHeatmap();
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
            range: 12,
            scale: {
                color: {
                    type: 'threshold',
                    // range: ['#4dd05a', '#37a446', '#166b34', '#14432a'],
                    range: ['#b5d4f4', '#6ea3e8', '#2389ff', '#0a3a6b'],
                    // range: ['#4d94d0', '#3783a4', '#16526b', '#14302a'],
                    domain: [2, 3, 6, 11],
                },
            },
            domain: {
                type: 'month',
                gutter: 4,
                label: { text: 'MMM', textAlign: 'start', position: 'top' },
            },
            subDomain: { type: 'ghDay', radius: 2, width: 11, height: 11, gutter: 4 },
            itemSelector: '#ex-ghDay',
        },
        [
            [
                Tooltip,
                {
                    text: function (date, value, dayjsDate) {
                        return (
                            (value ? value : 'No') + ' movie released ' + dayjsDate.format('dddd, MMMM D, YYYY')
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
            <a
                className="button button--sm button--secondary margin-top--sm"
                href="#"
                onClick={e => {
                    e.preventDefault();
                    cal.previous();
                }}
            >
                ← Previous
            </a>
            <a
                className="button button--sm button--secondary margin-top--sm margin-left--xs"
                href="#"
                onClick={e => {
                    e.preventDefault();
                    cal.next();
                }}
            >
                Next →
            </a>
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