
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
                Author: Eilon Alter <br>
                Date: 05/02/2022 <br><br>
                This is a singel page website made with jQuery as a project for fullstack course I'm taking , which sum the below content:  <br><br>
                
                HTML + CSS:<br>
                - New HTML5 tags<br>
                - CSS3 media queries and advanced selectors<br>
                - Dynamic page layouts<br>
                - Bootstrap & flex<br><br>
                
                JavaScript:<br>
                - Objects<br>
                - Callbacks, Promises, Async Await<br>
                - jQuery<br>
                - Single Page Application foundations<br>
                - Events<br>
                - Ajax (RESTful API)<br>
                - Documentation<br>
                External APIs<br><br>
            </p>
            
            <img 
            src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxANDRAQEBANEBANDQ0NDQ0VDRsIEA4NIB0iIiAdHx8kKDQsJCYxJx8fLTItMT1ARDBDIys9QT9BTDQuQzUBCgoKDQ0OFg0PFSsZFSU3Ly4rNzcyKy0tNys3KystLS0rNystKysrKy0rKysrKysrKysrKystKysrLSsrKysrK//AABEIAMgAyAMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAABAAIDBAUGBwj/xABBEAABAwIEAgUICAQGAwAAAAABAAIRAwQFEiExQWEGEyJRcQcjMoGRobHBFBVSYnKS0fAzQnOCJFNjorLhFjSD/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QAIxEAAgICAgMAAwEBAAAAAAAAAAECEQMxEiEEQVETIjJhFP/aAAwDAQACEQMRAD8A9X6RnSmObz8FiLZ6R70/B3yWOtY6MZ7AiAlCICokUIowjCBAARASTgExAATgEoRCAEAjCISQAE4OI4n2wgjCBjhWcP5nfmKcLl/23/mKjSSY7JfpdT7bvbKcL+r9s+wFQIJUh2yyMRq/a/2hOGKVe9v5VTKSVIdsu/W1T7nsTvrip9lnsI+azygUqQ+TNMYy7ixvtIThjJ4sH5oWUkikFs1xjI/y/wDfPySWQkjih8maHSH02fhPxWStTH/4rf6Y+JWYnHRMtgRSlEKiAgIpBEJiEAjCSJKAEs3FcetbITXrU6egIaXS4jkN1xnT/wAobbTPbW0Or+i+r6TaX/a8rayteVDUdnqOdqXuMrOeRRNYY3I9bu/KnatMUqVap94xRELEuvK7UzHq7akBrBLzU/RclS6PEgZnHwGisHo2zgud+QdK8Y0K/lOv3HR1Fk8BTz/Eq3h3lSuWCKop1NtS3IVztTo8Rt+qpVsJeElm/wBG/Hr0e1dHunlpeQ0u6uoYGUncrqmuBEggjvBzL5eNB9Iz2hz3C9c8mHSd1Zv0Wu8FzY6lx0cW90reGS+jnni49noqKZKctDIRTUSmoAJQSSQMCKCQSGFJJJAFzHT54cmN+azldxx3nzya1UZTjoUtjkQE0FOBVEBCIQCKACVxflK6THD7UMpOitWlrCDJaOJXXXFYMaXkw1gc9xOnZAXhl7UOJX9S5eXOp5z1QOnYGwhZ5J8UaY4cnRm4PgbqhFWvrmlwadSeZXT0qTWgAAACE3MnNcvPnNs9THBLonYFYpsUNEhXaaxbOiKIsuuyLrVrtwFYYzVSFqiy0jLuMIZUEQFjvwurZVG1qRIDHBwO+U/ouuYFJkBEESDuN9FePI0yMmJSR1fRnFhe2rKuztW1G9zxutaVxfRFn0a4fTafNXDczW/Zqj9R8F2QK9WEuUbPFyQ4SaHIIJKyAoJJIGJJJIIAKSSSAH427/Ev5ZfgFRzK1jBm4qeI+AVKU1oiW2SBycHKEJ4KZJOHJ0qAFPBQM4/yq4r9Gw/qwe1dPFL/AOe5/T1rz/CQOrECFoeV+86zEKNHXLRtw7f+ZxM+4BU8KokUwTpoNFyeQzt8ZFoBSspkqnd39Oh6Z1+yNTCzP/KodpT01jgVy8G9HZzS2dVb0DyWhToGFyln0xaPTpkaxI7Wi6vCsZo1x2XAnTTZRLG1s1hkiyZlIhJzFoFoOo4qM0SsqNinTGqslohTstPBNuKJA+SEhldtbq3Bw3Y4PA22Xb0age0OGoc0OB5LhHBdV0fq5rZn3czO/QHT3QvQ8aW0eX5sKqRqSkgkF1nCgolAJIGJEJqKAHhBIJIAjxMzXqfjKqFWb/8AjVP6j/iqxVLRm9glPBTE4JiJAUZTQszpFemhbOc05SSGh28EqW6VscYuTUUeTeUhjnY1UH2227WaRplC08mVoA4ADvUd7c1XXlMuylxpOz1Sxr3upg9nWJB1O28Ba9lVcarCchmGQ5ge2D3iFw5JKTtHpYoSimmYFLCGZjUq9onWDron1rO2fp1U8xDPkp8UuMrSYJ30AnVYNzfV2hrmhgDpgEZyFKt6LbUdk9x0eoOPm6lSmTtTqQ0T3B36x4qHD7Gpa1YB2d2htClZd1KjCXMgNMEgFnuKvWsvpufmANFrXgnXPTkCB6yPem70wi0+0ddhlclrZmQ0T4pYjiopNPeJ+7qq+D3TI7RjQRp6RVfHa9J7wwDMdo5rn49nXy6Md/T1zHEZJj70LYsOmNKu0Bwyk76yufucNou0Ipk8cgzkesx7lFT6PNd/CqOa4bscMui14xZjymn0d0HNe0OaZDtit7oq6aNTlXeB7AuA6O1a1B4oVQS1xPVu31XonRqkW2rZ3e+rU9RcY90LbBGpM5vKncUawRCSK6zhQkikkUDAigiEAEIpJIEVrozUee97vioSpKplx5kphVmY1OCEJwQA5YXS6lnto++2fBbqyekAm3fyAd7Cs8iuLRphdZEzzl+t3U/0qdOmPefmrdMmRG4gjxWfbP8A8RcSIOds+EBaVvqvOketHYattm1jQz7VTqYc0kS0bg7StdriNhI7t1HUdyd4KeRbhZj17aIAGgnfTVGjajRgESZcOX719QWjXbpoCD3k5lFasg95Mk8dU+Qljro3sOotygcgFh43aup9YGjUPa0n7pBj/j71vWBIAMJuN0hV1j0mtJ5EcVEXTNpxuJ5neGtTqmHPAgZY7MmF0FCtUpil1gnMBleR1b2O+8O4rQ+q5MSfhqr9LBmgdozOn2tFrzTXZgsTTuy9a0mw2oQNO0T3Dj612NmAKbACCGta0Qcw0XGOoZKeVrnagtjfRdJh+DMokFtSvEtdkzimzMOMABdHj6Zy+WqaNkFFRgp4XScQUkECUDCnBNKIKBDwgkEkAUyhCfCUKzMaAnAIgJ4CQDCFRvmgscCJlrh6louCqV2oBOmePOqxf128X5DHKFq0lk9KB1WLVcoAADCeGkBX7WuHRsvOyxp0erilas26ABAUhYFBbu09iVxdNbxCwZ2RfQy+gQJAzE69wVazuaIeWNexzhGYBwe4DwVDFcTpxqZgjZYlOvRqV2vZ2KjY7QOSTzVxj0RKXfR6fahhy6ngrF5bB0Fh0EwfvLlPpJdRcwVxSqOEB41LAtTB6b6LDTNV9UDXO45yVDjRvF2OfbOB2HqVmkxztNBzguV22Id6lK8BoJAUoHRnVaeUhp3cQ0eJMLrGDT9lcvbnrLqkDxfPrGvyXUtXoeOv1s8ny5XJIcE4FMKcF0HIEH5IlBKUAKU4JieEAPaJI5wknUNXN/EEEAVoRhIIqzMQCcAg1PCQwEKrXCuFVqyYjxvyjU8uJggEZ6FN3drJCzcOqwdTu4Rqum8rtrlFtcAaNc+i/wADqPgVwdtcCREyZkzsuTNH9mduCX6o61+IZGFxO3r1XK3eMVariJIE6DZW7yrmpOA2kAcdFDYYc54kaA7ncwudJLZ1tt9Igy1KgESf1RoYZVJOWM28TC3KGFlkauPvErRpWjxBAYYnTWmVRrHDZybqNZuZz8wIMbzouh6N425hIeTx0Osqzd2Rc0k03A6nSHglc5WAaSWkgg9pp7JBUvsHF43Z6fh9+0nM10g8VdurrszPAa7LzjAL14cWE8JnuW9f4nlGXcQI46zssuPdFPJas6Loy8Vrt5A0pUjJ37ROnwK69cl5PLQttn1jM3FRxbIjzYMD3yusXpY41FI8jNLlNsKcE1OCszCgiggBJ4TITwgCa1HnGfjb8Uk6xHnWfjakpkykikCjKZKUrUwJAU8FQgpwKBkhKhqJxconuQBynlAw/wCk4fWAALmN6xsmII1XhLXkHj3L6Hx0zbVh30neyF4JjVkaNU7wSSCsctXRvhurJresXtA4CGxtqulsXNDABGgHtXD03kEQTot3DrwiG77QuTJE7cUzoKt8WjSVWo4+8H16N30UXW9Y0gdx4qK1tRBcd9NOShG/J+mdhh9+2q2S3ksjpJYMf2xAIHhKNG4FINA3gac1n398SHBylXZpKdrsGGEUwX6S6Gz4J9Fr7y5ZSpmS94aOTeJ9QWHVvYp5Qe/8y9L8mXRupQabqu0ipWYBSad6dM7+BOi6MeO3bOLLlpUjuLC1bQpU6TPRpMaxvgArEpJLso4BSnIIhABCSCICAEnhNCcEAWsNHnmfiRRwoefZ6/gUlnPZpHRkygXJhKBctznJQ9LOoMyBekBM+oq1SspW0s3GOW653prevtadOnROWpXLpq+k5lMbxzMqJZFFWaQxSk6IekOJsDH0cwNRwALR2so59y4bE7MVWmRJG3DVWqNMNHEkklxJzOce8lThkhcU8rk7PQx4lFUef31g6lrByyecKK3qkGe6F3FzbA7gH3rBvMDDjLDlOum4Qpp7B42naIre7DQDOkj2K6L0ZZnhtzWU7CK+wbPg5NOHXDdOrefAZtUuKfspOS9GuL0TqdfSWXdXJrPhoJLjoBqSZU1vgVzWPo5Rpq52Vdd0f6Ott+04h9Qg9qNGjkk3GJSjOfRb8n3RKmHCvXyuqscCyidQwd/Mr1BoXCYSx30+3ySCauQxxpwZH77l6VVstBGhOkd5XThypxOTPhcZdMpoFJ2hIO43CUrc5aoScE2UgUwHJyYCnSkMKITU5AF/B/47eQd8EkcEHnvBrklnPZrDRz5lMJTyCUMqfNk/iQwIj98EYTVLbZaikXLcaLhOnFQuvo4Mo0wBz1K72mNPYuG6eUMt2yoNqtINn7wP/YWOX+TbD/Rz0J9MqPMnNXMdaJTRkKMWavUBIUhCmzRIpMtI4BHqeStwnsASbKQLa3V1wDW/sKJrwBJ0hdN0e6OOrRWuQW0xDmUTo6pzd3DlxSjBzdBKagrZa6E4KGD6XUEFzSKAOkM4u9fw8V0dZ0uB2DZd60K1wI5DQDZZFzel0wdPiu6MVFUjz5ScnbNZ5phkyZI1h06LCxHEWMacjduJMqJlyWzqVUvbpjmmWjVVyZFJ7LlLEabmt7Xac0FzQ0mCrLaoPf7IXICqcwA0EgeAW9g9J9WqBLsg3jirU2Q8SNei0vMNDifCNEXNLTBBB7iMq1bKm5skiAIynkm4rSeQDPYMawHZVXP6L8XwzAU4Kd9sOq6xpJDZD50VYFaJ2ZNNOmamAjzp/pn4hFHo+POO/B80llLZpHRhFMyyp3hMI7lJZEWpoZKny8E4NgIAmotkewetQYlhNO6oupVBodWv/mY7gQpaD8vrVtpDholVgujyXEsDr2lRzXNL2gmKrW5mOb8lTlezNoDfv9aidgls8y+hRcTuTTEysXh+M6I5/qPKrV2ildUb3r05/RqxI/8AXpjwlnzVihgdoz0bahPeaYefep/A/pp/0L4eUUwajoY1zyf5Q0vK3sN6LXVaC4NoN01ec7o8B84XoP0cDRrWtHcAGBSto98/AKlgXsh55ejDwro7b2xDjNaoIIqP7WU8hsFr1n6fsaI1ntYP07vFYmI35cYboPmtUkukYuTfbHX1fSJ39WiyLquGjdR1cziSSTHrVR9MkoEODyROusqpcPgK0+QIWddnWOJ+KQyxg1m64rho2kSeS9KtbdltTGwge9YfRKwFvR6141OvOFNiF8TJOp1gdyrQGwLsO0Ewqd3iTRSfTLhMwDyWPd13iiCHRncGxMaa/oq1IU93S48PFFgdCy4a6mKbA4tLCxxy7GN1WqWzmiSDExPNZlxjzqYa2nlGwAAzaroMJFetSzVi0NcNG5QNFcZURKNk3R4dp55NCSt4XbCmXwZBy/NJKT7JSaVFY4AP8w/kn5pn1B/qT/ZHzSSUljfqF322+whNOBVODqfvHySSQIBwSr30/wAx/RBuE1hsG/mSSQBOyzrDdgP9wCkFu/7DvaHJJJjHNouG7XeyU5wcB6FT2QgkiwsjJcNcpH9pcq1e4LQTDtOUpJIGZNao50k7nhsqb6Ub7nVJJAEL2hQOakkkwIqxgKtgVl9KuQY7IPuRSUgdpiFUNAY3Zg965zEK5MpJJsYXDPRaZMNynwCr1qoY34JJIEQYPb9bWbOsuE+C7y/vOrAY3QABvdqkkmhlrAqoe18GYcAeOqSSSCWf/9k="
            alt="loading">
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