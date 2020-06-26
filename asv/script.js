

function renderToc() {

    let h2c =0, h3c = 0;
    let toc = []
    for (let h of document.querySelectorAll("h2, h3")) {
        h.id = h.innerText.replace(/\W/g,'_').toLowerCase();
        if (h.tagName === "H2") {
            h2c++
            h3c = 0;
            toc.push({
                title: `${h2c}. ${h.innerText}`,
                id: h.id,
                self: h,
                sub: []
            })

        } else if (h.tagName === "H3") {
            h3c++;

            let t = toc[toc.length - 1];
            if (t) {
                t.sub.push({
                    title: `${h2c}.${h3c}. ${h.innerText}`,
                    id: h.id
                })
            }
        }
    }

    function tn(t, level) {
        let a = document.createElement("a"),
            li = document.createElement("li");
        a.setAttribute("href", "#" + t.id);
        a.innerText = t.title
        li.appendChild(a);

        if (t.sub && t.sub.length > 0) {
            let sub = [];
            let uul = document.createElement("ul");
            uul.setAttribute("class", "toc")
            for (const s of t.sub) {
                sub.push(tn(s, level + 1));
                uul.appendChild(sub[sub.length-1]);
            }
            li.appendChild(uul.cloneNode(true));
            if (level === 0) {
                t.self.parentNode.insertBefore(uul, t.self.nextSibling);
            }
        }

        return li;
    }

    let ul = document.createElement("ul", 0);
    toc.map(t => ul.appendChild(tn(t, 0)));
    document.getElementById("toc").appendChild(ul)

}


renderToc();


google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawCharts);

function drawCharts() {
    {

        var ds1 = [['Severity', 'Count']];
        Object.keys(data.telemetry.all).forEach(function (k) {
            ds1.push([k, data.telemetry.all[k]])
        })

        var ds2 = [['Server', 'Risk']];
        data.servers.map(s => ds2.push([s.Name, s.Telemetry.projected_risk]));

        new google.visualization.PieChart(document.getElementById('severity_chart')).draw(
            google.visualization.arrayToDataTable(ds1), {
                pieHole: 0.4,
                chartArea: {left: 10, top: 30, width: '50%', height: '75%'}
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


    }
}

