
let checked = 0;
let interval;
let options;
let liveReportsNames = []

$(function () {
    $(".progress").hide()
    /*--------------------------------------------- load all coins to the page----------------------------------------------- */
    const loadcoins = async function (data) {

        let cardsData = await data
        $("#coins-container").empty()//if clicked more than once
        $("#chartContainer").empty()//clear chart if needed
        clearInterval(interval)//clear interval if needed

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

        $(".show-more-info").hide()//hide the space for the more info until needed 
        $(".show-less-button").hide()//same
        $(".progress").hide()
    }
    /*--------------------------------------load new info for the selected coin----------------------------------------------- */
    const loadMoreInfo = function (data, element, id) {
        element.empty()//if clicked more then once
        localStorage.setItem(`${id}`, JSON.stringify(data))//save to local storage ..skipped unnecessary api calls

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
    /*--------------------------------------initialize first chart with selected coins names----------------------------------------------- */
    const initLiveChart = function (names) {
        $("#coins-container").empty()

        //chart properties:
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
                name: names[0],
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
                name: names[1],
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "yellow",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            }, {
                type: "line",
                showInLegend: true,
                name: names[2],
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "green",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            }, {
                type: "line",
                showInLegend: true,
                name: names[3],
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "red",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            }, {
                type: "line",
                showInLegend: true,
                name: names[4],
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
    /*------------------------------------------------append new data to the live chart------------------------------------------------------ */
    const loadLiveReports = function (data) {
        let values = []
        // a loop to save all coins values into array
        Object.entries(data).forEach(element => {
            if (!!element) {
                values.push(Object.entries(element[1])[0][1])
            }
        })

        let i = 0;
        //loop to append all values as chart points
        values.forEach(() => {
            options.data[i].dataPoints.push({ x: new Date(), y: values[i] })
            i++
        })
        $("#chartContainer").CanvasJSChart(options);//render chart
    }
    /*------------------------------------------------an api call to get coins data------------------------------------------------------ */
    $("#show-coins-button").on("click", function () {
        clearInterval(interval)//clear interval if needed
        $(".progress").toggle("slow")
        checked = 0;
        liveReportsNames = []

        $.ajax({
            url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",//get the coins by value
            timeout: '10000000',//only to make the progress bar more revealing
            cache: true,
            success: data => {
                loadcoins(data)
            }
        })
    })
    /*------------------------------------------------an api call to get more info on clicked coin------------------------------------------------------ */
    $(document).on("click", ".show-more-button", function () {
        let id = $(this).parent().attr("id")//id needed for the api call
        let coin = JSON.parse(localStorage.getItem(`${id}`))//a varibale to check if the coin info are already in the local storage

        if (coin === null) {
            $.ajax({
                url: `https://api.coingecko.com/api/v3/coins/${id}`,//get the coin info
                success: data => {
                    console.log("from api")//state if an api call commited
                    loadMoreInfo(data, $(this).parent().children("div"), id)
                }
            })
        }
        else {
            console.log("from-localstorage")//state that the data is already in the local storage
            loadMoreInfo(coin, $(this).parent().children("div"), id)
        }
    })
    /*------------------------------------------------ *bonus* open live server section  ------------------------------------------------------ */
    $("#show-live-reports-button").on("click", function () {

        checked = 0;
        $("#chartContainer").empty()//clear chart if needed
        clearInterval(interval)//clear interval if clicked more than once without checking new coins
        liveReportsNames = []

        let liveReportsNamesList = liveReportsList()//get the selected coins names for the live server
        if (liveReportsNamesList.length > 0) { //check if any was selected

            initLiveChart(liveReportsNamesList)//empty chart with names

            /** first api call to skiped the first 2 sec wait of the interval */
            $.ajax({
                url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${liveReportsNamesList}&tsyms=USD`,//an api call to selected coins info
                cache: true,
                success: data => {
                    loadLiveReports(data)
                }
            })
            /** api call every 2 sec for new info to the chart */
            interval = setInterval(function () {
                $.ajax({
                    url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${liveReportsNamesList}&tsyms=USD`,
                    cache: true,
                    success: data => {
                        loadLiveReports(data)//append to chart
                    }
                })
            }, 2000)
        }
        else {
            alert("please select coins ")//no coins selected
        }
    })
    /*------------------------------------------------open the about section------------------------------------------------------ */
    $("#about-button").on("click", function () {
        $("#chartContainer").empty()//clear chart if needed
        clearInterval(interval)//clear interval if needed
        $("#coins-container").empty()//clear page

        checked = 0;
        liveReportsNames = []

        let about = `
            <p class ="about">
                author: eilon alter <br>
                date: 09/01/2022 <br><br>
                this website ....
            </p>
        `
        $("#coins-container").append(about)
    })
    /*-----------------------------------------------toggle between show more and show less--------------------------------------------------- */
    $(document).on("click", ".show-less-button", function () {
        $(this).parent().children("div").toggle("slow")//hide the more info
        $(this).parent().children("button").toggle("fast")//hide the show less button
    })
    /*------------------------------------------------search func------------------------------------------------------ */
    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $(".card").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
    /*------------------------------------------------checked coin func------------------------------------------------------ */
    $(document).on("click", ".form-check-input:checkbox:checked", function () {
        checked++

        // const cardsForUncheck = $(`input[name="${$(this).attr('name')}"]`);
        // cardsForUncheck.prop('checked', true);     *****needed if there were cases when the modal had option to check input also*******

        //set modal on
        if (checked == 6) {
            asignModal()//asign all checked coins
            $('#exampleModal').modal("show")
        }

        if (checked > 6) { //eliminate the option to check more than 6 ,
            // necessery if the modal was close by clicking the screen and not uncheck other coin
            checked--
            $(this).prop('checked', false)
            $('#exampleModal').modal("show")
        }
    })
    /*------------------------------------------------uncheck coin func------------------------------------------------------ */
    $(document).on("click", ".form-check-input:checkbox:not(:checked)", function () {
        checked--;

        const cardsForUncheck = $(`input[name="${$(this).attr('name')}"]`);
        cardsForUncheck.prop('checked', false);// uncheck from modal and main page

        $(".modal-body").html("")//all modal coins appended only when more than five coins selected
    })
    /*------------------------------------------------clear local storage every 2 min------------------------------------------------------ */
    setInterval(function () {
        localStorage.clear();
    }, 120000)
    /*------------------------------------------------ asign all checked coins to modal ------------------------------------------------------ */
    const asignModal = function () {
        $(".modal-body").html("")
        // a loop for all checked coins
        $(".form-check-input:checkbox:checked").each(function () {
            $(".modal-body").append($(this).parent().parent().clone().attr("aria-label", "Close").attr("data-bs-dismiss", "modal"))
            //append to modal with the close option to the check box
        })
    }
    /*------------------------------------------------make a list of all check coins names------------------------------------------------------ */
    const liveReportsList = () => {
        $(".form-check-input:checkbox:checked").each(function () {
            liveReportsNames.push($(this)[0].name)
        })
        return liveReportsNames
    }
})