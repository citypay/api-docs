


google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawCharts);
function drawCharts() {{

    var ds1 = [['Severity', 'Count']];
    Object.keys(data.telemetry.all).forEach(function (k) { ds1.push([k, data.telemetry.all[k]]) })

    var ds2 = [['Server', 'Risk']];
    data.servers.map(s => ds2.push([s.Name, s.Telemetry.projected_risk]));

    new google.visualization.PieChart(document.getElementById('severity_chart')).draw(
            google.visualization.arrayToDataTable(ds1), {
                pieHole: 0.4,
                chartArea: {left:10,top:30,width:'50%',height:'75%'}
            });


    // var view = new google.visualization.DataView(google.visualization.arrayToDataTable(ds2));
    // view.setColumns([0, 1,
    //     { calc: "stringify",
    //         sourceColumn: 1,
    //         type: "string",
    //         role: "annotation" },
    //     2]);
    //
    // var options = {
    //     title: "Density of Precious Metals, in g/cm^3",
    //     width: 600,
    //     height: 400,
    //     bar: {groupWidth: "95%"},
    //     legend: { position: "none" },
    // };


    // new google.visualization.BarChart(document.getElementById('server_summary_chart')).draw(v2, options);


}}
