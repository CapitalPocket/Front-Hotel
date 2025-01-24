"use client"
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const Graphs = ({ metric, park }: { metric: string, park: string }) => {

    const [data, setData] = useState({
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
            {
                label: metric == 'sales' ? 'Ventas por mes' : 'Interacciones por mes',
                data: [6500, 5900, 8000, 8100, 5600, 18270, 5900, 8000, 8100, 5600, 18270, 900],
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    });
    
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                let endpoint: string;

                if (metric === 'sales') {
                    endpoint = 'getSalesByMonthPark';
                } else {
                    endpoint = 'getInteractionsPark';
                }

                const response = await axios.post(`/api/marketing/${endpoint}`, { idpark: park == 'Parque Norte' ? 1 : 2 })
                setData({ 
                    ...data, 
                    labels: response.data.map((invoice: any) => invoice.Mes),
                    datasets: [
                        { 
                            ...data.datasets[0], 
                            data: response.data.map((invoice: any) => invoice.Total) 
                        }
                    ] 
                });
            } catch (error) {
                console.error('Failed to fetch card data:', error);
            }
        };

        fetchInvoices();
    }, [data, park, metric]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: metric == 'sales' ? 'Ventas del último año' : 'Interacciones del último año',
            },
        },
    };

    return (
        <Line data={data} options={options} />
    );
};

export default Graphs;