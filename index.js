let checked = 0;
let interval;
let options;

$(function () {
    $(".progress").hide()

    const loadcoins = async function (data) {

        let cardsData = await data
        $("#coins-container").empty()
        $("#chartContainer").empty()
        clearInterval(interval)

        let cards = ""
        for (let i = 0; i < 50; i++) {
            const element = cardsData[i];

            cards += `
            <div class="card text-black bg-light mb-3" style="max-width: 18rem;">
                <div class="card-header">${element.symbol}
                    <div class="form-check form-switch">
                        <input class="form-check-input" name=${element.symbol} type="checkbox" role="switch" id="flexSwitchCheckDefault">
                    </div>
                </div>
                    <div class="card-body">
                        <h5 class="card-title">${element.name}</h5>
                        <div id="${element.id}" class="card-text">
                            <button class="show-more-button btn btn-outline-primary">show more</button>
                            <div class="show-more-info"></div>
                            <button class="show-less-button btn btn-outline-primary">show less</button>
                        </div>
                    </div>
            </div>
            `
        }

        $("#coins-container").append(cards)
        $(".show-more-info").hide()
        $(".show-less-button").hide()
        $(".progress").hide()
    }

    const loadMoreInfo = function (data, element, id) {
        element.empty()
        localStorage.setItem(`${id}`, JSON.stringify(data))

        let moreInfo = ""
        moreInfo += `
            <hr>
            <img src="${data.image.small}" alt="none"><br><br>
            <p>USD : ${data.market_data.current_price.usd}$</p>
            <p>EUR : ${data.market_data.current_price.eur}€</p>
            <p>ILS : ${data.market_data.current_price.ils}₪</p><br>
        `
        element.append(moreInfo)
        element.toggle("slow")
        element.parent().children("button").toggle("fast")
    }
    const initLiveChart = function () {
        $("#coins-container").empty()

        // let names = []
        // Object.keys(data).forEach(element => {
        //     if (!!element) {
        //         names.push(element)
        //     }
        // })

        options = {
            animationEnabled: true,
            theme: "light2",
            title: {
                text: "Live Currency Details"
            },
            axisX: {
                title: "Time",
                valueFormatString: "HH:mm:ss"
            },
            axisY: {
                title: "Value In Dollars",
                suffix: "$"
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                verticalAlign: "bottom",
                horizontalAlign: "left",
                dockInsidePlotArea: true,
                itemclick: toogleDataSeries
            },
            data: [{
                type: "line",
                showInLegend: true,
                name: "names[0]",
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "black",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            },
            {
                type: "line",
                showInLegend: true,
                name: "names[1]",
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "yellow",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            }, {
                type: "line",
                showInLegend: true,
                name: "names[1]",
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "green",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            }, {
                type: "line",
                showInLegend: true,
                name: "names[1]",
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "red",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            }, {
                type: "line",
                showInLegend: true,
                name: "names[1]",
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "blue",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            },
            ]
        };
        $("#chartContainer").CanvasJSChart(options);

        function toogleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
        $(".progress").hide()
    }
    const loadLiveReports = function (data) {
        let values = []

        Object.entries(data).forEach(element => {
            if (!!element) {
                console.log(Object.entries(element[1])[0][1])
                values.push(Object.entries(element[1])[0][1])
            }
        })

        //console.log("names:" + names)
        console.log("values:" + values)

        let i = 0;
        values.forEach(() => {
            options.data[i].dataPoints.push({ x: new Date(), y: values[i] })
            i++
        })
        $("#chartContainer").CanvasJSChart(options);
    }


    $("#show-coins-button").on("click", function () {
        $(".progress").toggle("slow")

        $.ajax({
            url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
            timeout: '10000000',
            cache: true,
            success: data => {
                loadcoins(data)
            }
        })
    })

    $(document).on("click", ".show-more-button", function () {
        let id = $(this).parent().attr("id")
        let coin = JSON.parse(localStorage.getItem(`${id}`))

        if (coin === null) {
            $.ajax({
                url: `https://api.coingecko.com/api/v3/coins/${id}`,
                success: data => {
                    console.log("from api")
                    loadMoreInfo(data, $(this).parent().children("div"), id)
                }
            })
        }
        else {
            console.log("from-localstorage")
            loadMoreInfo(coin, $(this).parent().children("div"), id)
        }
    })

    $("#show-live-reports-button").on("click", function () {
        $(".progress").toggle("slow")
        //liveReportsList()
        initLiveChart()
        interval = setInterval(function () {
            $.ajax({
                url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=eth,btc&tsyms=USD`,
                cache: true,
                success: data => {
                    loadLiveReports(data)
                }
            })
        }, 2000)
    })

    $("#about-button").on("click", function () {
        $("#chartContainer").empty()
        clearInterval(interval)
        $("#coins-container").empty()

        let about = `
            <p class ="about">
                author: eilon alter <br>
                date: 09/01/2022 <br><br>
                this website ....
            </p>
        `
        $("#coins-container").append(about)
        liveReportsList()
    })

    $(document).on("click", ".show-less-button", function () {
        $(this).parent().children("div").toggle("slow")
        $(this).parent().children("button").toggle("fast")
    })

    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $(".card").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $(document).on("click", ".form-check-input:checkbox:checked", function () {
        //$(this).switch("slow")
        checked++
        console.log(checked)
        if (checked >= 5) {
            $(".form-check-input").attr("data-bs-toggle", "modal")
            $(".form-check-input").attr("data-bs-target", "#exampleModal")

        }
        else {
            $(".form-check-input").removeAttr("data-bs-toggle", "modal")
            $(".form-check-input").removeAttr("data-bs-target", "#exampleModal")
        }

        $(".modal-body").html("")
        asignModal()
    })

    $(document).on("click", ".form-check-input:checkbox:not(:checked)", function () {
        checked--;
        const cardsForUncheck = $(`input[name="${$(this).attr('name')}"]`);
        //Unchecking all cards
        cardsForUncheck.prop('checked',false);


        if (checked === 5) {
            $(".form-check-input").attr("data-bs-toggle", "modal")
            $(".form-check-input").attr("data-bs-target", "#exampleModal")
        }
        else {
            $(".form-check-input").removeAttr("data-bs-toggle", "modal")
            $(".form-check-input").removeAttr("data-bs-target", "#exampleModal")
        }

    })

    setInterval(function () {
        localStorage.clear();
    }, 120000)

    const asignModal = function () {
        $(".form-check-input:checkbox:checked").each(function () {
            $(".modal-body").append($(this).parent().parent().clone().attr("aria-label", "Close").attr("data-bs-dismiss", "modal").attr("data-bs-dismiss", "modal"))
        })
    }

    const liveReportsList = () => {
        $(".form-check-input:checkbox:checked").each(function () {
            let array = []
            // array.push($(this).parent().parent())
            console.log("element:  " + element)
        })
    }

})