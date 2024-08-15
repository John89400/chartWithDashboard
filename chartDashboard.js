import { LightningElement, wire } from 'lwc';
import getChartData from '@salesforce/apex/ChartController.getChartData';
import chartjs from '@salesforce/resourceUrl/ChartJS';
import { loadScript } from 'lightning/platformResourceLoader';

export default class ChartDashboard extends LightningElement {
    barChart;
    lineChart;
    pieChart;
    chartJsInitialized = false;
    chartData;

    @wire(getChartData)
    wiredData({ error, data }) {
        if (data) {
            this.chartData = data;
            this.initializeCharts();
        } else if (error) {
            console.error(error);
        }
    }

    renderedCallback() {
        if (this.chartJsInitialized) {
            return;
        }
        Promise.all([loadScript(this, chartjs)])
            .then(() => {
                this.chartJsInitialized = true;
                this.initializeCharts();
            })
            .catch(error => {
                console.error('Chart.js not loaded', error);
            });
    }

    initializeCharts() {
        if (this.chartData && this.chartJsInitialized) {
            const barCanvas = this.template.querySelector('[data-id="barChart"]');
            const lineCanvas = this.template.querySelector('[data-id="lineChart"]');
            const pieCanvas = this.template.querySelector('[data-id="pieChart"]');

            const labels = this.chartData.map(item => item.StageName);
            const amounts = this.chartData.map(item => item.totalAmount);

            this.barChart = new Chart(barCanvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Opportunities by Stage',
                        data: amounts,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            this.lineChart = new Chart(lineCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Opportunities by Stage',
                        data: amounts,
                        fill: false,
                        borderColor: '#36A2EB',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            this.pieChart = new Chart(pieCanvas, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: amounts,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }
}
